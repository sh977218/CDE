import { config } from '../system/parseConfig';
import { DataElement as DE } from 'shared/de/dataElement.model';
import { wipeDatatype } from 'shared/de/deValidator';
import { CbError, MongooseType } from 'shared/models.model';
import { isOrgCurator } from 'shared/system/authorizationShared';
import * as dataElementschema from 'shared/de/assets/dataElement.schema.json';
import { forwardError } from 'server/errorHandler/errorHandler';
import { find, forEach, isEmpty } from 'lodash';

const Ajv = require('ajv');
const connHelper = require('../../server/system/connections');
const mongoData = require('../../server/system/mongo-data');
const logging = require('../../server/system/logging');
export const elastic = require('../../server/cde/elastic');
const schemas = require('../../server/cde/schemas');

export const type = 'cde';
export const name = 'CDEs';

export type DataElementDraft = DE;

const ajvElt = new Ajv({allErrors: true});
ajvElt.addSchema(require('../../shared/de/assets/adminItem.schema'));
export let validateSchema: any;
try {
    const schema = dataElementschema;
    (schema as any).$async = true;
    validateSchema = validateSchema = ajvElt.compile(schema);
} catch (err) {
    console.log('Error: dataElement.schema.json does not compile. ' + err);
    process.exit(1);
}

schemas.dataElementSchema.pre('save', function(next) {
    const elt = this;

    if (elt.archived) {
        return next();
    }
    validateSchema(elt).then(() => {
        try {
            elastic.updateOrInsert(elt);
        } catch (exception) {
            logging.errorLogger.error(`Error Indexing CDE ${elt.tinyId}`, {
                details: exception,
                stack: new Error().stack
            });
        }

        const valueDomain = elt.valueDomain;
        if (valueDomain.datatype === 'Value List' && isEmpty(valueDomain.permissibleValues)) {
            next('Value List with empty permissible values.');
        } else {
            next();
        }
    }, err => next(`Cde ${elt.tinyId} has error: ${err}`));
});

const conn = connHelper.establishConnection(config.database.appData);
const CdeAudit = conn.model('CdeAudit', schemas.auditSchema);
export const DataElement = conn.model('DataElement', schemas.dataElementSchema);
export const DataElementDraft = conn.model('DataElementDraft', schemas.draftSchema);
export const DataElementSource = conn.model('DataElementSource', schemas.dataElementSourceSchema);
export const User = require('../user/userDb').User;

const auditModifications = mongoData.auditModifications(CdeAudit);
export const getAuditLog = mongoData.auditGetLog(CdeAudit);
export const dao = DataElement;

mongoData.attachables.push(DataElement);

function updateUser(elt, user) {
    wipeDatatype(elt);
    elt.updated = new Date();
    elt.updatedBy = {
        userId: user._id,
        username: user.username,
    };
}

export function byExisting(elt: DE, cb: CbError<MongooseType<DE>>) {
    DataElement.findOne({_id: elt._id, tinyId: elt.tinyId}, cb);
}

export function byId(id, cb) {
    DataElement.findOne({_id: id}, cb);
}

export function byTinyId(tinyId, cb) {
    return DataElement.findOne({tinyId, archived: false}, cb);
}

export function latestVersionByTinyId(tinyId, cb) {
    DataElement.findOne({tinyId, archived: false}, (err, dataElement) => {
        cb(err, dataElement.version);
    });
}

export function byTinyIdList(tinyIdList, callback) {
    DataElement.find({archived: false}).where('tinyId')
        .in(tinyIdList)
        .slice('valueDomain.permissibleValues', 10)
        .exec((err, cdes) => {
            const result = [];
            cdes.forEach(mongoData.formatElt);
            forEach(tinyIdList, t => {
                const c = find(cdes, cde => cde.tinyId === t);
                if (c) { result.push(c); }
            });
            callback(err, result);
        });
}

/* ---------- PUT NEW REST API Implementation above  ---------- */

export function getStream(condition) {
    return DataElement.find(condition).sort({_id: -1}).cursor();
}

export function count(condition, callback) {
    return DataElement.countDocuments(condition, callback);
}

export function byTinyIdVersion(tinyId, version, cb) {
    if (version) {
        byTinyIdAndVersion(tinyId, version, cb);
    } else {
        byTinyId(tinyId, cb);
    }
}

export function byTinyIdAndVersion(tinyId, version, callback) {
    const _query: any = {tinyId};
    if (version) {
        _query.version = version;
    } else {
        _query.$or = [{version: null}, {version: ''}];
    }
    DataElement.find(_query).sort({updated: -1}).limit(1).exec((err, elts) => {
        callback(err, elts[0]);
    });
}

export function eltByTinyId(tinyId, callback) {
    DataElement.findOne({
        archived: false,
        tinyId,
    }, callback);
}

const viewedCdes = {};
const threshold = config.viewsIncrementThreshold;

export function inCdeView(cde) {
    if (!viewedCdes[cde._id]) {
        viewedCdes[cde._id] = 0;
    }
    viewedCdes[cde._id]++;
    if (viewedCdes[cde._id] >= threshold && cde && cde._id) {
        viewedCdes[cde._id] = 0;
        DataElement.updateOne({_id: cde._id}, {$inc: {views: threshold}}).exec();
    }
}

export function create(elt, user, callback) {
    wipeDatatype(elt);
    elt.created = Date.now();
    elt.createdBy = {
        userId: user._id,
        username: user.username,
    };
    const newItem = new DataElement(elt);
    newItem.tinyId = mongoData.generateTinyId();
    newItem.save((err, newElt) => {
        callback(err, newElt);
        if (!err) {
            auditModifications(user, null, newElt);
        }
    });
}

export function update(elt, user, options: any = {}, callback: CbError<DE>) {
    if (elt.toObject) {
        elt = elt.toObject();
    }
    DataElement.findById(elt._id, (err, dataElement) => {
        if (dataElement.archived) {
            callback(new Error('You are trying to edit an archived elements'));
            return;
        }
        delete elt._id;
        if (!elt.history) {
            elt.history = [];
        }
        elt.history.push(dataElement._id);
        updateUser(elt, user);

        // user cannot edit sources.
        if (!options.updateSource) {
            elt.sources = dataElement.sources;
        }

        // because it's draft not edit attachment
        if (options.updateAttachments) {
            elt.attachments = dataElement.attachments;
        }

        const newElt = new DataElement(elt);

        // archive dataElement and replace it with newElt
        DataElement.findOneAndUpdate({_id: dataElement._id, archived: false}, {$set: {archived: true}}, (err, doc) => {
            if (err || !doc) {
                callback(err, doc);
                return;
            }
            newElt.save((err, savedElt) => {
                if (err) {
                    DataElement.findOneAndUpdate({_id: dataElement._id}, {$set: {archived: false}},
                        () => callback(err));
                } else {
                    callback(undefined, savedElt);
                    auditModifications(user, dataElement, savedElt);
                }
            });
        });
    });
}

export function derivationOutputs(inputTinyId, cb) {
    DataElement.find({archived: false, 'derivationRules.inputs': inputTinyId}).exec(cb);
}

export function findModifiedElementsSince(date, cb) {
    DataElement.aggregate([
        {
            $match: {
                archived: false,
                updated: {$gte: date},
            },
        },
        {$limit: 2000},
        {$sort: {updated: -1}},
        {$group: {_id: '$tinyId'}},
    ]).exec(cb);

}

export function originalSourceByTinyIdSourceName(tinyId, sourceName, cb) {
    DataElementSource.findOne({tinyId, source: sourceName}, cb);
}
