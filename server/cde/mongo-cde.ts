import { config } from '../../server/system/parseConfig';
import { Cb2, CbError, MongooseType } from '../../shared/models.model';
import { checkDefinitions, checkPvUnicity, wipeDatatype } from '../../shared/de/deValidator';
import { isOrgCurator } from '../../shared/system/authorizationShared';
import { DataElement as DE } from '../../shared/de/dataElement.model';

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

const ajvElt = new Ajv();
ajvElt.addSchema(require('../../shared/de/assets/adminItem.schema'));
export let validateSchema: any;
fs.readFile(path.resolve(__dirname, '../../shared/de/assets/dataElement.schema.json'), (err, file) => {
    if (!file) {
        console.log('Error: dataElement.schema.json missing. ' + err);
        process.exit(1);
    }
    try {
        const schema = JSON.parse(file.toString());
        schema.$async = true;
        validateSchema = validateSchema = ajvElt.compile(schema);
    } catch (err) {
        console.log('Error: dataElement.schema.json does not compile. ' + err);
        process.exit(1);
    }
});

schemas.dataElementSchema.post('remove', (doc, next) => {
    elastic.dataElementDelete(doc, next);
});
schemas.dataElementSchema.pre('save', function (next) {
    let elt = this;

    if (this.archived) return next();
    let cdeError: any = checkPvUnicity(elt.valueDomain);
    if (cdeError.allValid) {
        cdeError = checkDefinitions(elt);
    }
    if (cdeError && !cdeError.allValid) {
        cdeError.tinyId = this.tinyId;
        logging.errorLogger.error(cdeError, {
            stack: new Error().stack,
            details: JSON.stringify(cdeError)
        });
        return next(new Error(JSON.stringify(cdeError)));
    }

    // validate
    if (!validateSchema(elt)) {
        return next(validateSchema.errors.map(e => e.dataPath + ': ' + e.message).join(', '));
    }
    let valErr = elt.validateSync();
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

let conn = connHelper.establishConnection(config.database.appData);
let CdeAudit = conn.model('CdeAudit', schemas.auditSchema);
export const DataElement = conn.model('DataElement', schemas.dataElementSchema);
export const DataElementDraft = conn.model('DataElementDraft', schemas.draftSchema);
export const DataElementSource = conn.model('DataElementSource', schemas.dataElementSourceSchema);
export const User = require('../user/userDb').User;

let auditModifications = mongo_data.auditModifications(CdeAudit);
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
            username: user.username
        };
    }
    elt.updated = new Date();
    elt.updatedBy = {
        userId: user._id,
        username: user.username
    };
}

export function byExisting(elt: DE, cb: CbError<MongooseType<DE>>) {
    DataElement.findOne({_id: elt._id, tinyId: elt.tinyId}, cb);
}

export function byId(id, cb) {
    DataElement.findOne({'_id': id}, cb);
}

export function byIdList(idList, cb) {
    DataElement.find({}).where('_id').in(idList).exec(cb);
}

export function byTinyId(tinyId, cb) {
    return DataElement.findOne({'tinyId': tinyId, archived: false}, cb);
}

export function latestVersionByTinyId(tinyId, cb) {
    DataElement.findOne({tinyId: tinyId, archived: false}, function (err, dataElement) {
        cb(err, dataElement.version);
    });
}

export function byTinyIdList(tinyIdList, callback) {
    DataElement.find({'archived': false}).where('tinyId')
        .in(tinyIdList)
        .slice('valueDomain.permissibleValues', 10)
        .exec((err, cdes) => {
            let result = [];
            cdes.forEach(mongo_data.formatElt);
            _.forEach(tinyIdList, t => {
                let c = _.find(cdes, cde => cde.tinyId === t);
                if (c) result.push(c);
            });
            callback(err, result);
        });
}

export function draftByTinyId(tinyId, cb) {
    let cond = {
        tinyId: tinyId,
        archived: false
    };
    DataElementDraft.findOne(cond, cb);
}

export function draftById(id, cb) {
    let cond = {
        _id: id
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
    DataElementDraft.remove({tinyId: tinyId}, cb);
}

export function draftsList(criteria, cb) {
    return DataElementDraft
        .find(criteria, {
            'designations.designation': 1,
            'stewardOrg.name': 1,
            tinyId: 1,
            updated: 1,
            'updatedBy.username': 1
        })
        .sort({'updated': -1})
        .exec(cb);
}

/* ---------- PUT NEW REST API Implementation above  ---------- */

export function getPrimaryName(elt) {
    return elt.designations[0].designation;
}

export function getStream(condition) {
    return DataElement.find(condition).sort({_id: -1}).cursor();
}

export function count(condition, callback) {
    return DataElement.countDocuments(condition, callback);
}

export function desByConcept(concept, callback) {
    DataElement.find(
        {
            '$or': [{'objectClass.concepts.originId': concept.originId},
                {'property.concepts.originId': concept.originId},
                {'dataElementConcept.concepts.originId': concept.originId}]
        },
        'designations source registrationState stewardOrg updated updatedBy createdBy tinyId version views')
        .limit(20)
        .where('archived').equals(false)
        .exec(function (err, cdes) {
            callback(cdes);
        });
}

export function byTinyIdVersion(tinyId, version, cb) {
    if (version) this.byTinyIdAndVersion(tinyId, version, cb);
    else this.byTinyId(tinyId, cb);
}

export function byTinyIdAndVersion(tinyId, version, callback) {
    let query: any = {tinyId: tinyId};
    if (version) query.version = version;
    else query.$or = [{version: null}, {version: ''}];
    DataElement.find(query).sort({'updated': -1}).limit(1).exec(function (err, elts) {
        if (err) callback(err);
        else if (elts.length) callback('', elts[0]);
        else callback('', null);
    });
}

export function eltByTinyId(tinyId, callback) {
    if (!tinyId) callback('tinyId is undefined!', null);
    DataElement.findOne({
        'tinyId': tinyId,
        'archived': false
    }).exec(function (err, de) {
        callback(err, de);
    });
}

var viewedCdes = {};
var threshold = config.viewsIncrementThreshold || 50;
export function inCdeView(cde) {
    if (!viewedCdes[cde._id]) viewedCdes[cde._id] = 0;
    viewedCdes[cde._id]++;
    if (viewedCdes[cde._id] >= threshold && cde && cde._id) {
        viewedCdes[cde._id] = 0;
        DataElement.updateOne({_id: cde._id}, {$inc: {views: threshold}}).exec();
    }
}

// TODO this method should be removed.
export function save(mongooseObject, callback) {
    mongooseObject.save(function (err) {
        callback(err, mongooseObject);
    });
}

export function create(elt, user, callback) {
    defaultElt(elt);
    elt.created = Date.now();
    elt.createdBy = {
        userId: user._id,
        username: user.username
    };
    let newItem = new DataElement(elt);
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

        let newElt = new DataElement(elt);

        // archive dataElement and replace it with newElt
        DataElement.findOneAndUpdate({_id: dataElement._id, archived: false}, {$set: {archived: true}}, (err, doc) => {
            if (err || !doc) {
                callback(err, doc);
                return;
            }
            newElt.save((err, savedElt) => {
                if (err) {
                    DataElement.findOneAndUpdate({_id: dataElement._id}, {$set: {archived: false}}, () => callback(err));
                } else {
                    callback(undefined, savedElt);
                    auditModifications(user, dataElement, savedElt);
                }
            });
        });
    });
}

export function updatePromise(elt, user) {
    return new Promise(resolve => update(elt, user, {}, resolve));
}

export function archiveCde(cde, callback) {
    DataElement.findOne({'_id': cde._id}, (err, cde) => {
        cde.archived = true;
        cde.save(() => callback('', cde));
    });
}

export function getDistinct(what, callback) {
    DataElement.distinct(what).exec(callback);
}

export function query(query, callback) {
    DataElement.find(query, callback);
}

export function transferSteward(from, to, callback) {
    DataElement.updateMany({'stewardOrg.name': from}, {$set: {'stewardOrg.name': to}}).exec(function (err, result) {
        callback(err, result.nModified);
    });
}

export function byOtherId(source, id, cb) {
    DataElement.find({archived: false}).elemMatch('ids', {source: source, id: id}).exec(function (err, cdes) {
        if (cdes.length > 1)
            cb('Multiple results, returning first', cdes[0]);
        else cb(err, cdes[0]);
    });
}

export function byOtherIdAndNotRetired(source, id, cb) {
    DataElement.find({
        archived: false,
        'registrationState.registrationStatus': {$ne: 'Retired'}
    }).elemMatch('ids', {source: source, id: id}).exec(function (err, cdes) {
        if (err) cb(err, null);
        else if (cdes.length > 1)
            cb('Multiple results, returning first. source: ' + source + ' id: ' + id, cdes[0]);
        else if (cdes.length === 0) {
            cb('No results', null);
        } else cb(err, cdes[0]);
    });
}

export function bySourceIdVersion(source, id, version, cb) {
    DataElement.find({archived: false}).elemMatch('ids', {
        source: source, id: id, version: version
    }).exec(function (err, cdes) {
        if (cdes.length > 1) cb('Multiple results, returning first', cdes[0]);
        else cb(err, cdes[0]);
    });
}

export function bySourceIdVersionAndNotRetiredNotArchived(source, id, version, cb) {
    //noinspection JSUnresolvedFunction
    DataElement.find({
        'archived': false,
        'registrationState.registrationStatus': {$ne: 'Retired'}
    }).elemMatch('ids', {
        source: source, id: id, version: version
    }).exec(function (err, cdes) {
        cb(err, cdes);
    });
}

export function findCurrCdesInFormElement(allCdes, cb) {
    DataElement.find({archived: false}, 'tinyId version derivationRules').where('tinyId').in(allCdes).exec(cb);
}

export function derivationOutputs(inputTinyId, cb) {
    DataElement.find({archived: false, 'derivationRules.inputs': inputTinyId}).exec(cb);
}

export function findModifiedElementsSince(date, cb) {
    DataElement.aggregate([
        {
            $match: {
                archived: false,
                updated: {$gte: date}
            }
        },
        {$limit: 2000},
        {$sort: {updated: -1}},
        {$group: {'_id': '$tinyId'}}
    ]).exec(cb);

}

export function checkOwnership(req, id, cb) {
    if (!req.isAuthenticated()) return cb('You are not authorized.', null);
    byId(id, function (err, elt) {
        if (err || !elt) return cb('Element does not exist.', null);
        if (!isOrgCurator(req.user, elt.stewardOrg.name))
            return cb('You do not own this element.', null);
        cb(null, elt);
    });
}

export function originalSourceByTinyIdSourceName(tinyId, sourceName, cb) {
    DataElementSource.findOne({tinyId: tinyId, source: sourceName}, cb);
}