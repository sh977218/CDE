import { config } from '../system/parseConfig';
import { DataElement as DE } from 'shared/de/dataElement.model';
import { checkDefinitions, checkPvUnicity, wipeDatatype } from 'shared/de/deValidator';
import { CbError, MongooseType } from 'shared/models.model';
import { isOrgCurator } from 'shared/system/authorizationShared';

import * as dataElementschema from 'shared/de/assets/dataElement.schema.json';

const Ajv = require('ajv');
const fs = require('fs');
const _ = require('lodash');
const path = require('path');
const connHelper = require('../../server/system/connections');
const mongo_data = require('../../server/system/mongo-data');
const logging = require('../../server/system/logging');
export const elastic = require('../../server/cde/elastic');
const schemas = require('../../server/cde/schemas');

export const type = 'cde';
export const name = 'CDEs';

export type DataElementDraft = DE;

const ajvElt = new Ajv();
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

schemas.dataElementSchema.pre('save', function (next) {
    const elt = this;

    if (this.archived) return next();
    let cdeError: any = checkPvUnicity(elt.valueDomain);
    if (cdeError.allValid) {
        cdeError = checkDefinitions(elt);
    }
    if (cdeError && !cdeError.allValid) {
        cdeError.tinyId = this.tinyId;
        logging.errorLogger.error(cdeError, {
            details: JSON.stringify(cdeError),
            stack: new Error().stack,
        });
        return next(new Error(JSON.stringify(cdeError)));
    }

    // validate
    if (!validateSchema(elt)) {
        return next(validateSchema.errors.map(e => e.dataPath + ': ' + e.message).join(', '));
    }
    const valErr = elt.validateSync();
    if (valErr) {
        return next('Doc does not pass validation: ' + valErr.message);
    }

    try {
        elastic.updateOrInsert(elt);
    } catch (exception) {
        logging.errorLogger.error('Error Indexing CDE', {details: exception, stack: new Error().stack});
    }
    next();
});

const conn = connHelper.establishConnection(config.database.appData);
const CdeAudit = conn.model('CdeAudit', schemas.auditSchema);
export const DataElement = conn.model('DataElement', schemas.dataElementSchema);
export const DataElementDraft = conn.model('DataElementDraft', schemas.draftSchema);
export const DataElementSource = conn.model('DataElementSource', schemas.dataElementSourceSchema);
export const User = require('../user/userDb').User;

const auditModifications = mongo_data.auditModifications(CdeAudit);
export const getAuditLog = mongo_data.auditGetLog(CdeAudit);
export const dao = DataElement;
export const daoDraft = DataElementDraft;

mongo_data.attachables.push(DataElement);

function defaultElt(elt) {
    wipeDatatype(elt);
    if (!elt.registrationState || !elt.registrationState.registrationStatus) {
        elt.registrationState = {registrationStatus: 'Incomplete'};
    }
}

function updateUser(elt, user) {
    defaultElt(elt);
    if (!elt.created) elt.created = new Date();
    if (!elt.createdBy) {
        elt.createdBy = {
            userId: user._id,
            username: user.username,
        };
    }
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
            cdes.forEach(mongo_data.formatElt);
            _.forEach(tinyIdList, t => {
                const c = _.find(cdes, cde => cde.tinyId === t);
                if (c) result.push(c);
            });
            callback(err, result);
        });
}

export function draftByTinyId(tinyId, cb) {
    const cond = {
        archived: false,
        tinyId,
    };
    DataElementDraft.findOne(cond, cb);
}

export function draftById(id, cb) {
    const cond = {
        _id: id,
    };
    DataElementDraft.findOne(cond, cb);
}

export function draftSave(elt, user, cb) {
    updateUser(elt, user);
    DataElementDraft.findById(elt._id, (err, doc) => {
        if (err) {
            cb(err);
            return;
        }
        if (!doc) {
            new DataElementDraft(elt).save(cb);
            return;
        }
        if (doc.__v !== elt.__v) {
            cb();
            return;
        }
        const version = elt.__v;
        elt.__v++;
        DataElementDraft.findOneAndUpdate({_id: elt._id, __v: version}, elt, {new: true}, cb);
    });
}

export function draftDelete(tinyId, cb) {
    DataElementDraft.remove({tinyId}, cb);
}

export function draftsList(criteria): Promise<DataElementDraft[]>;
export function draftsList(criteria, cb: CbError): void;
export function draftsList(criteria, cb?: CbError): void | Promise<DataElementDraft[]> {
    return DataElementDraft
        .find(criteria, {
            'designations.designation': 1,
            'stewardOrg.name': 1,
            tinyId: 1,
            updated: 1,
            'updatedBy.username': 1,
        })
        .sort({updated: -1})
        .exec(cb);
}

/* ---------- PUT NEW REST API Implementation above  ---------- */

export function getStream(condition) {
    return DataElement.find(condition).sort({_id: -1}).cursor();
}

export function count(condition, callback) {
    return DataElement.countDocuments(condition, callback);
}

export function byTinyIdVersion(tinyId, version, cb) {
    if (version) this.byTinyIdAndVersion(tinyId, version, cb);
    else this.byTinyId(tinyId, cb);
}

export function byTinyIdAndVersion(tinyId, version, callback) {
    const _query: any = {tinyId};
    if (version) _query.version = version;
    else _query.$or = [{version: null}, {version: ''}];
    DataElement.find(_query).sort({updated: -1}).limit(1).exec((err, elts) => {
        callback(err, elts[0]);
    });
}

export function eltByTinyId(tinyId, callback) {
    if (!tinyId) callback('tinyId is undefined!', null);
    DataElement.findOne({
        archived: false,
        tinyId,
    }, callback);
}

const viewedCdes = {};
const threshold = config.viewsIncrementThreshold;

export function inCdeView(cde) {
    if (!viewedCdes[cde._id]) viewedCdes[cde._id] = 0;
    viewedCdes[cde._id]++;
    if (viewedCdes[cde._id] >= threshold && cde && cde._id) {
        viewedCdes[cde._id] = 0;
        DataElement.updateOne({_id: cde._id}, {$inc: {views: threshold}}).exec();
    }
}

export function create(elt, user, callback) {
    defaultElt(elt);
    elt.created = Date.now();
    elt.createdBy = {
        userId: user._id,
        username: user.username,
    };
    const newItem = new DataElement(elt);
    newItem.tinyId = mongo_data.generateTinyId();
    newItem.save((err, newElt) => {
        callback(err, newElt);
        if (!err) auditModifications(user, null, newElt);
    });
}

export function update(elt, user, options: any = {}, callback: CbError<DE> = () => {}) {
    if (elt.toObject) elt = elt.toObject();
    DataElement.findById(elt._id, (err, dataElement) => {
        if (dataElement.archived) {
            callback(new Error('You are trying to edit an archived elements'));
            return;
        }
        delete elt._id;
        if (!elt.history) elt.history = [];
        elt.history.push(dataElement._id);
        updateUser(elt, user);

        // user cannot edit sources.
        if (!options.updateSources) {
            elt.sources = dataElement.sources;
        }

        // because it's draft not edit attachment
        if (options.updateAttachments) {
            elt.attachments = dataElement.attachments;
        }
        if (options.updateClassification) {
            elt.classification = dataElement.classification;
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

export function transferSteward(from, to, callback) {
    DataElement.updateMany({'stewardOrg.name': from}, {$set: {'stewardOrg.name': to}}).exec((err, result) => {
        callback(err, result.nModified);
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

export function checkOwnership(req, id, cb) {
    if (!req.isAuthenticated()) return cb('You are not authorized.', null);
    byId(id, (err, elt) => {
        if (err || !elt) return cb('Element does not exist.', null);
        if (!isOrgCurator(req.user, elt.stewardOrg.name)) {
            return cb('You do not own this element.', null);
        }
        cb(null, elt);
    });
}

export function originalSourceByTinyIdSourceName(tinyId, sourceName, cb) {
    DataElementSource.findOne({tinyId, source: sourceName}, cb);
}
