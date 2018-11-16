const _ = require("lodash");
const config = require('../system/parseConfig');
const schemas = require('./schemas');
const mongo_data_system = require('../system/mongo-data');
const connHelper = require('../system/connections');
const logging = require('../system/logging');
const cdediff = require("./cdediff");
const elastic = require('./elastic');
const deValidator = require('@std/esm')(module)('../../shared/de/deValidator');
const draftSchema = require('./schemas').draftSchema;
const isOrgCurator = require('../../shared/system/authorizationShared').isOrgCurator;

exports.type = "cde";
exports.name = "CDEs";

schemas.dataElementSchema.post('remove', function (doc, next) {
    elastic.dataElementDelete(doc, function (err) {
        next(err);
    });
});
schemas.dataElementSchema.pre('save', function (next) {
    var self = this;
    let cdeError = deValidator.checkPvUnicity(self.valueDomain);
    if (cdeError && cdeError.pvNotValidMsg) {
        logging.errorLogger.error(cdeError, {
            stack: new Error().stack,
            details: JSON.stringify(cdeError)
        });
        next(cdeError);
    } else {
        try {
            elastic.updateOrInsert(self);
        } catch (exception) {
            logging.errorLogger.error("Error Indexing CDE", {details: exception, stack: new Error().stack});
        }
        next();
    }
});


var conn = connHelper.establishConnection(config.database.appData);

var User = require('../user/userDb').User;
var CdeAudit = conn.model('CdeAudit', schemas.cdeAuditSchema);

exports.User = User;
exports.elastic = elastic;

var mongo_data = this;

var DataElement = conn.model('DataElement', schemas.dataElementSchema);
var DataElementDraft = conn.model('DataElementDraft', draftSchema);
exports.DataElement = exports.dao = DataElement;
exports.DataElementDraft = exports.daoDraft = DataElementDraft;

mongo_data_system.attachables.push(exports.DataElement);

exports.byId = function (id, cb) {
    DataElement.findOne({'_id': id}, cb);
};

exports.byIdList = function (idList, cb) {
    DataElement.find({}).where("_id").in(idList).exec(cb);
};

exports.byTinyId = function (tinyId, cb) {
    DataElement.findOne({'tinyId': tinyId, archived: false}, cb);
};

exports.latestVersionByTinyId = function (tinyId, cb) {
    DataElement.findOne({tinyId: tinyId, archived: false}, function (err, dataElement) {
        cb(err, dataElement.version);
    });
};

exports.byTinyIdList = function (tinyIdList, callback) {
    DataElement.find({'archived': false}).where('tinyId')
        .in(tinyIdList)
        .slice('valueDomain.permissibleValues', 10)
        .exec((err, cdes) => {
            let result = [];
            cdes.forEach(mongo_data_system.formatElt);
            _.forEach(tinyIdList, t => {
                let c = _.find(cdes, cde => cde.tinyId === t);
                if (c) result.push(c);
            });
            callback(err, result);
        });
};

exports.draftDataElement = function (tinyId, cb) {
    let cond = {
        tinyId: tinyId,
        archived: false
    };
    DataElementDraft.findOne(cond, cb);
};
exports.draftDataElementById = function (id, cb) {
    let cond = {
        _id: id
    };
    DataElementDraft.findOne(cond, cb);
};
exports.saveDraftDataElement = function (elt, cb) {
    delete elt.__v;
    DataElementDraft.findOneAndUpdate({_id: elt._id}, elt, {upsert: true, new: true}, cb);
};

exports.deleteDraftDataElement = function (tinyId, cb) {
    DataElementDraft.remove({tinyId: tinyId}, cb);
};

exports.draftsList = (criteria, cb) => {
    DataElementDraft.find(criteria, {"updatedBy.username": 1, "updated": 1, "designations.designation": 1, tinyId: 1})
        .sort({"updated": -1}).exec(cb);
};

/* ---------- PUT NEW REST API Implementation above  ---------- */

exports.getPrimaryName = function (elt) {
    return elt.designations[0].designation;
};

exports.getStream = function (condition) {
    return DataElement.find(condition).sort({_id: -1}).cursor();
};

exports.count = function (condition, callback) {
    DataElement.count(condition).count().exec(function (err, count) {
        callback(err, count);
    });
};

exports.desByConcept = function (concept, callback) {
    DataElement.find(
        {
            '$or': [{'objectClass.concepts.originId': concept.originId},
                {'property.concepts.originId': concept.originId},
                {'dataElementConcept.concepts.originId': concept.originId}]
        },
        "designations source registrationState stewardOrg updated updatedBy createdBy tinyId version views")
        .limit(20)
        .where("archived").equals(false)
        .exec(function (err, cdes) {
            callback(cdes);
        });
};

exports.byTinyIdVersion = function (tinyId, version, cb) {
    if (version) this.byTinyIdAndVersion(tinyId, version, cb);
    else this.byTinyId(tinyId, cb);
};

exports.byTinyIdAndVersion = function (tinyId, version, callback) {
    let query = {tinyId: tinyId};
    if (version) query.version = version;
    else query.$or = [{version: null}, {version: ''}];
    DataElement.find(query).sort({'updated': -1}).limit(1).exec(function (err, elts) {
        if (err) callback(err);
        else if (elts.length) callback("", elts[0]);
        else callback("", null);
    });
};

exports.eltByTinyId = function (tinyId, callback) {
    if (!tinyId) callback("tinyId is undefined!", null);
    DataElement.findOne({
        'tinyId': tinyId,
        "archived": false
    }).exec(function (err, de) {
        callback(err, de);
    });
};

exports.cdesByIdList = function (idList, callback) {
    DataElement.find().where('_id')
        .in(idList)
        .slice('valueDomain.permissibleValues', 10)
        .exec(function (err, cdes) {
            cdes.forEach(mongo_data.formatCde);
            callback(err, cdes);
        });
};

exports.cdesByTinyIdListInOrder = function (idList, callback) {
    exports.byTinyIdList(idList, function (err, cdes) {
        var reorderedCdes = idList.map(function (id) {
            for (var i = 0; i < cdes.length; i++) {
                if (id === cdes[i].tinyId) return cdes[i];
            }
        });
        callback(err, reorderedCdes);
    });
};

var viewedCdes = {};
var threshold = config.viewsIncrementThreshold || 50;
exports.inCdeView = function (cde) {
    if (!viewedCdes[cde._id]) viewedCdes[cde._id] = 0;
    viewedCdes[cde._id]++;
    if (viewedCdes[cde._id] >= threshold && cde && cde._id) {
        viewedCdes[cde._id] = 0;
        DataElement.update({_id: cde._id}, {$inc: {views: threshold}}).exec();
    }
};

// TODO this method should be removed.
exports.save = function (mongooseObject, callback) {
    mongooseObject.save(function (err) {
        callback(err, mongooseObject);
    });
};

exports.create = function (cde, user, callback) {
    let newDe = new DataElement(cde);
    if (!newDe.registrationState || !newDe.registrationState.registrationStatus) {
        newDe.registrationState = {
            registrationStatus: "Incomplete"
        };
    }
    newDe.created = Date.now();
    newDe.createdBy.userId = user._id;
    newDe.createdBy.username = user.username;
    newDe.tinyId = mongo_data_system.generateTinyId();
    newDe.save((err, newElt) => {
        if (err) {
            logging.errorLogger.error("Error: Cannot create CDE", {
                origin: "cde.mongo-cde.create.1",
                stack: new Error().stack,
                details: "elt " + JSON.stringify(newElt)
            });
        }
        callback(err, newElt);
        auditModifications(null, newElt, user);
    });
};

exports.fork = function (elt, user, callback) {
    exports.update(elt, user, callback, function (newDe, dataElement) {
        newDe.forkOf = dataElement.tinyId;
        newDe.registrationState.registrationStatus = "Incomplete";
        newDe.tinyId = mongo_data_system.generateTinyId();
        dataElement.archived = false;
    });
};

exports.newObject = function (obj) {
    return new DataElement(obj);
};

exports.update = function (elt, user, callback, special) {
    let id = elt._id;
    if (elt.toObject) elt = elt.toObject();
    return DataElement.findById(id, function (err, dataElement) {
        delete elt._id;
        if (!elt.history) elt.history = [];
        elt.history.push(dataElement._id);
        elt.updated = new Date().toJSON();
        elt.updatedBy = {
            userId: user._id,
            username: user.username
        };
        elt.sources = dataElement.sources;
        elt.comments = dataElement.comments;
        var newDe = new DataElement(elt);

        if (special) {
            special(newDe, dataElement);
        }

        if (!newDe.designations || newDe.designations.length === 0) {
            logging.errorLogger.error("Error: Cannot save CDE without names", {
                origin: "cde.mongo-cde.update.1",
                stack: new Error().stack,
                details: "elt " + JSON.stringify(elt)
            });
            callback("Cannot save without names");
        }

        newDe.save(function (err) {
            if (err) {
                logging.errorLogger.error("Error: Cannot save CDE", {
                    origin: "cde.mongo-cde.update.2",
                    stack: new Error().stack,
                    details: "err " + err
                });
                callback(err);
            } else {
                dataElement.archived = true;
                dataElement.save(function (err) {
                    if (err) {
                        logging.errorLogger.error("Error: Cannot save CDE", {
                            origin: "cde.mongo-cde.update.3",
                            stack: new Error().stack,
                            details: "err " + err
                        });
                    }
                    callback(err, newDe);
                    auditModifications(dataElement, newDe, user);
                });
            }
        });
    });
};

exports.updatePromise = function (elt, user) {
    return new Promise(async (resolve, reject) => {
        let id = elt._id;
        if (elt.toObject) elt = elt.toObject();
        let dataElement = await DataElement.findById(id);
        delete elt._id;
        if (!elt.history) elt.history = [];
        elt.history.push(dataElement._id);
        elt.updated = new Date().toJSON();
        elt.updatedBy = user;
        elt.sources = dataElement.sources;
        elt.comments = dataElement.comments;
        let newDe = new DataElement(elt);
        if (!newDe.designations || newDe.designations.length === 0) {
            logging.errorLogger.error("Error: Cannot save CDE without names", {
                origin: "cde.mongo-cde.update.1",
                stack: new Error().stack,
                details: "elt " + JSON.stringify(elt)
            });
        }
        await newDe.save();
        dataElement.archived = true;
        await dataElement.save();
        resolve();
    })
};

exports.archiveCde = function (cde, callback) {
    DataElement.findOne({'_id': cde._id}, function (err, cde) {
        cde.archived = true;
        cde.save(function () {
            callback("", cde);
        });
    });
};

exports.getDistinct = function (what, callback) {
    DataElement.distinct(what).exec(function (err, result) {
        callback(err, result);
    });
};

exports.query = function (query, callback) {
    DataElement.find(query, callback);
};

exports.transferSteward = function (from, to, callback) {
    DataElement.update({'stewardOrg.name': from}, {$set: {'stewardOrg.name': to}}, {multi: true}).exec(function (err, result) {
        callback(err, result.nModified);
    });
};

let auditModifications = function (oldDe, newDe, user) {
    let message = {
        date: new Date()
        , user: {
            username: user.username
        }
        , adminItem: {
            tinyId: newDe.tinyId
            , version: newDe.version
            , _id: newDe._id
            , name: newDe.designations[0].designation
        }
    };

    if (oldDe) {
        message.previousItem = {
            tinyId: oldDe.tinyId
            , version: oldDe.version
            , _id: oldDe._id
            , name: oldDe.designations[0].designation
        };
        message.diff = cdediff.diff(newDe, oldDe);
    }

    CdeAudit(message).save(err => {
        if (err) {
            logging.errorLogger.error("Error: Cannot add to CDE Audit. newDe.tinyId: " + newDe.tinyId, {
                origin: "cde.mongo-cde.auditModifications",
                stack: new Error().stack,
                details: "err " + err
            });
        }
    });
};

exports.getCdeAuditLog = function (params, callback) {
    CdeAudit.find()
        .sort('-date')
        .skip(params.skip)
        .limit(params.limit)
        .exec(function (err, logs) {
            callback(err, logs);
        });
};

exports.byOtherId = function (source, id, cb) {
    DataElement.find({archived: false}).elemMatch("ids", {source: source, id: id}).exec(function (err, cdes) {
        if (cdes.length > 1)
            cb("Multiple results, returning first", cdes[0]);
        else cb(err, cdes[0]);
    });
};

exports.byOtherIdAndNotRetired = function (source, id, cb) {
    DataElement.find({
        archived: false,
        "registrationState.registrationStatus": {$ne: "Retired"}
    }).elemMatch("ids", {source: source, id: id}).exec(function (err, cdes) {
        if (err) cb(err, null);
        else if (cdes.length > 1)
            cb("Multiple results, returning first. source: " + source + " id: " + id, cdes[0]);
        else if (cdes.length === 0) {
            cb("No results", null);
        }
        else cb(err, cdes[0]);
    });
};

exports.bySourceIdVersion = function (source, id, version, cb) {
    DataElement.find({archived: false}).elemMatch("ids", {
        source: source, id: id, version: version
    }).exec(function (err, cdes) {
        if (cdes.length > 1) cb("Multiple results, returning first", cdes[0]);
        else cb(err, cdes[0]);
    });
};

exports.bySourceIdVersionAndNotRetiredNotArchived = function (source, id, version, cb) {
    //noinspection JSUnresolvedFunction
    DataElement.find({
        "archived": false,
        "registrationState.registrationStatus": {$ne: "Retired"}
    }).elemMatch("ids", {
        source: source, id: id, version: version
    }).exec(function (err, cdes) {
        cb(err, cdes);
    });
};

exports.findCurrCdesInFormElement = function (allCdes, cb) {
    DataElement.find({archived: false}, "tinyId version derivationRules").where("tinyId").in(allCdes).exec(cb);
};

exports.derivationOutputs = function (inputTinyId, cb) {
    DataElement.find({archived: false, "derivationRules.inputs": inputTinyId}).exec(cb);
};

exports.findModifiedElementsSince = function (date, cb) {
    DataElement.aggregate([
        {
            $match: {
                archived: false,
                updated: {$gte: date}
            }
        },
        {$limit: 2000},
        {$sort: {updated: -1}},
        {$group: {"_id": "$tinyId"}}
    ]).exec(cb);

};

exports.checkOwnership = function (req, id, cb) {
    if (!req.isAuthenticated()) return cb("You are not authorized.", null);
    exports.byId(id, function (err, elt) {
        if (err || !elt) return cb("Element does not exist.", null);
        if (!isOrgCurator(req.user, elt.stewardOrg.name))
            return cb("You do not own this element.", null);
        cb(null, elt);
    });
};
