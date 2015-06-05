var mongoose = require('mongoose')
    , config = require('config')
    , schemas = require('./schemas')
    , schemas_system = require('../../system/node-js/schemas')
    , mongo_data_system = require('../../system/node-js/mongo-data')
    , connHelper = require('../../system/node-js/connections')
    , logging = require('../../system/node-js/logging')
    , adminItemSvc = require('../../system/node-js/adminItemSvc.js')
    , cdesvc = require("./cdesvc")
    , deValidator = require("../shared/deValidator.js").deValidator
    ;

exports.type = "cde";
exports.name = "CDEs";

var mongoUri = config.mongoUri;
var DataElement;
var PinningBoard;
var User;
var CdeAudit;

var connectionEstablisher = connHelper.connectionEstablisher;
var connection = null;

var iConnectionEstablisherCde = new connectionEstablisher(mongoUri, 'CDE');
iConnectionEstablisherCde.connect(function (conn) {
    DataElement = conn.model('DataElement', schemas.dataElementSchema);
    exports.DataElement = DataElement;
    PinningBoard = conn.model('PinningBoard', schemas.pinningBoardSchema);
    User = conn.model('User', schemas_system.userSchema);
    CdeAudit = conn.model('CdeAudit', schemas.cdeAuditSchema);
    connection = conn;
});

var mongo_data = this;

exports.exists = function (condition, callback) {
    DataElement.count(condition, function (err, result) {
        callback(err, result > 0);
    })
};

exports.boardsByUserId = function (userId, callback) {
    PinningBoard.find({"owner.userId": userId}).exec(function (err, result) {
        callback(result);
    });
};

exports.nbBoardsByUserId = function (userId, callback) {
    PinningBoard.count({"owner.userId": userId}).exec(function (err, result) {
        callback(err, result);
    });
};

exports.publicBoardsByDeTinyId = function (tinyId, callback) {
    PinningBoard.find({"pins.deTinyId": tinyId, "shareStatus": "Public"}).exec(function (err, result) {
        callback(result);
    });
};

exports.userTotalSpace = function (name, callback) {
    mongo_data_system.userTotalSpace(DataElement, name, callback);
};

exports.deCount = function (callback) {
    DataElement.find({"archived": null}).count().exec(function (err, count) {
        callback(count);
    });
};

exports.boardList = function (from, limit, searchOptions, callback) {
    PinningBoard.find(searchOptions).exec(function (err, boards) {
        // TODO Next line throws "undefined is not a function.why?
        PinningBoard.find(searchOptions).count(searchOptions).exec(function (err, count) {
            callback(err, {
                boards: boards
                , page: Math.ceil(from / limit)
                , pages: Math.ceil(count / limit)
                , totalNumber: count
            });
        });
    });
};

exports.desByConcept = function (concept, callback) {
    DataElement.find(
        {
            '$or': [{'objectClass.concepts.originId': concept.originId},
                {'property.concepts.originId': concept.originId},
                {'dataElementConcept.concepts.originId': concept.originId}]
        },
        "naming source sourceId registrationState stewardOrg updated updatedBy createdBy tinyId version views")
        .limit(20)
        .where("archived").equals(null)
        .exec(function (err, cdes) {
            callback(cdes);
        });
};

exports.byTinyIdAndVersion = function (tinyId, version, callback) {
    DataElement.find({
        'tinyId': tinyId,
        "version": version,
        "registrationState.registrationStatus": {$ne: "Retired"}
    }).sort({"updated": -1}).limit(1).exec(function (err, des) {
        callback(err, des[0]);
    });
};

exports.eltByTinyId = function (tinyId, callback) {
    if (!tinyId) callback("tinyId is undefined!", null);
    DataElement.findOne({
        'tinyId': tinyId,
        "archived": null,
        "registrationState.registrationStatus": {$ne: "Retired"}
    }).exec(function (err, de) {
        callback(err, de);
    });
};

exports.formatCde = function (cde) {
    function escapeHTML(s) {
        return s.replace(/&/g, '&amp;').replace(/\"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    cde._doc.stewardOrgCopy = cde.stewardOrg;
    cde._doc.primaryNameCopy = escapeHTML(cde.naming[0].designation);
    cde._doc.primaryDefinitionCopy = escapeHTML(cde.naming[0].definition);
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

exports.cdesByTinyIdList = function (idList, callback) {
    DataElement.find({'archived': null}).where('tinyId')
        .in(idList)
        .slice('valueDomain.permissibleValues', 10)
        .exec(function (err, cdes) {
            cdes.forEach(mongo_data.formatCde);
            callback(err, cdes);
        });
};

exports.cdesByTinyIdListInOrder = function (idList, callback) {
    exports.cdesByTinyIdList(idList, function (err, cdes) {
        var reorderedCdes = idList.map(function (id) {
            for (var i = 0; i < cdes.length; i++) {
                if (id === cdes[i].tinyId) return cdes[i];
            }
        });
        callback(err, reorderedCdes);
    });
};

exports.priorCdes = function (cdeId, callback) {
    DataElement.findById(cdeId).exec(function (err, dataElement) {
        if (dataElement !== null) {
            return DataElement.find({}, "updated updatedBy changeNote")
                .where("_id").in(dataElement.history).exec(function (err, cdes) {
                    callback(err, cdes);
                });
        } else {

        }
    });
};

exports.acceptFork = function (fork, orig, callback) {
    fork.forkOf = undefined;
    fork.tinyId = orig.tinyId;
    orig.archived = true;
    fork.stewardOrg = orig.stewardOrg;
    fork.registrationState.registrationStatus = orig.registrationState.registrationStatus;
    fork.save(function (err) {
        if (err) {
            callback(err);
        }
        else {
            orig.save(function (err) {
                callback(err);
            });
        }
    });
};

exports.isForkOf = function (fork, callback) {
    return DataElement.findOne({tinyId: fork.forkOf}).where("archived").equals(null).exec(function (err, cde) {
        callback(err, cde);
    });
};

exports.forks = function (cdeId, callback) {
    DataElement.findById(cdeId).exec(function (err, dataElement) {
        if (dataElement !== null) {
            return DataElement.find({forkOf: dataElement.tinyId}, "tinyId naming stewardOrg updated updatedBy createdBy created updated changeNote")
                .where("archived").equals(null).where("registrationState.registrationStatus").ne("Retired").exec(function (err, cdes) {
                    callback("", cdes);
                });
        } else {
            callback(err, []);
        }
    });
};

exports.byId = function (cdeId, callback) {
    if (!cdeId) callback("Not found", null);
    DataElement.findOne({'_id': cdeId}, function (err, cde) {
        if (!cde) err = "Cannot find CDE";
        callback(err, cde);
    });
};

var viewedCdes = {};
var threshold = config.viewsIncrementThreshold || 50;
exports.incDeView = function (cde) {
    if (!viewedCdes[cde._id]) viewedCdes[cde._id] = 0;
    viewedCdes[cde._id]++;
    if (viewedCdes[cde._id] >= threshold && cde && cde._id) {
        viewedCdes[cde._id] = 0;
        DataElement.update({_id: cde._id}, {$inc: {views: threshold}}).exec();
    }
};

exports.boardById = function (boardId, callback) {
    PinningBoard.findOne({'_id': boardId}, function (err, b) {
        if (!b) err = "Cannot find board";
        callback(err, b);
    });
};

exports.removeBoard = function (boardId, callback) {
    PinningBoard.remove({'_id': boardId}, function (err) {
        if (callback) callback(err);
    });
};
//TODO: Consider moving
exports.addToViewHistory = function (cde, user) {
    if (!cde || !user) return logging.errorLogger.error("Error: Cannot update viewing history", {
        origin: "cde.mongo-cde.addToViewHistory",
        stack: new Error().stack,
        details: {"cde": cde, user: user}
    });
    User.update({'_id': user._id}, {
        $push: {
            viewHistory: {
                $each: [cde.tinyId]
                , $position: 0
                , $slice: 1000
            }
        }
    }).exec(function (err) {
        if (err) logging.errorLogger.error("Error: Cannot update viewing history", {
            origin: "cde.mongo-cde.addToViewHistory",
            stack: new Error().stack,
            details: {"cde": cde, user: user}
        });
    });
};

exports.newBoard = function (board, callback) {
    var newBoard = new PinningBoard(board);
    newBoard.save(function (err) {
        callback(err, newBoard);
    });
};

exports.save = function (mongooseObject, callback) {
    mongooseObject.save(function (err) {
        callback(err, mongooseObject);
    });
};

exports.create = function (cde, user, callback) {
    var newDe = new DataElement(cde);
    if (!newDe.registrationState || !newDe.registrationState.registrationStatus) {
        newDe.registrationState = {
            registrationStatus: "Incomplete"
        };
    }
    newDe.created = Date.now();
    newDe.createdBy.userId = user._id;
    newDe.createdBy.username = user.username;
    newDe.tinyId = mongo_data_system.generateTinyId();
    newDe.save(function (err) {
        callback(err, newDe);
    });
};

exports.fork = function (elt, user, callback) {
    exports.update(elt, user, callback, function (newDe, dataElement) {
        newDe.forkOf = dataElement.tinyId;
        newDe.registrationState.registrationStatus = "Incomplete";
        newDe.tinyId = mongo_data_system.generateTinyId();
        dataElement.archived = undefined;
    });
};

exports.update = function (elt, user, callback, special) {
    if (!deValidator.checkPvUnicity(elt.valueDomain).allValid) {
        return callback("Invalid Permissible Value");
    }

    return DataElement.findById(elt._id, function (err, dataElement) {
        delete elt._id;
        if (!elt.history) elt.history = [];
        elt.history.push(dataElement._id);
        elt.updated = new Date().toJSON();
        elt.updatedBy = {};
        elt.updatedBy.userId = user._id;
        elt.updatedBy.username = user.username;
        elt.comments = dataElement.comments;
        var newDe = new DataElement(elt);

        dataElement.archived = true;

        if (special) {
            special(newDe, dataElement);
        }

        if (newDe.naming.length < 1) {
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
                dataElement.save(function (err) {
                    if (err) {
                        logging.errorLogger.error("Error: Cannot save CDE", {
                            origin: "cde.mongo-cde.update.3",
                            stack: new Error().stack,
                            details: "err " + err
                        });
                    }
                    callback(err, newDe);
                    exports.saveModification(dataElement, newDe, user);
                });
            }
        });
    });
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

exports.allPropertiesKeys = function (callback) {
    DataElement.distinct("properties.key").exec(function (err, keys) {
        callback(err, keys);
    });
};

exports.query = function (query, callback) {
    DataElement.find(query).exec(function (err, result) {
        callback(err, result);
    });
};

exports.transferSteward = function (from, to, callback) {
    DataElement.update({'stewardOrg.name': from}, {$set: {'stewardOrg.name': to}}, {multi: true}).exec(function (err, result) {
        callback(err, result);
    });
};

exports.saveModification = function (oldDe, newDe, user) {
    var diff = cdesvc.diff(newDe, oldDe);
    var message = {
        date: new Date()
        , user: {
            username: user.username
        }
        , adminItem: {
            tinyId: newDe.tinyId
            , version: newDe.version
            , _id: newDe._id
            , name: newDe.naming[0].designation
        }
        , previousItem: {
            tinyId: oldDe.tinyId
            , version: oldDe.version
            , _id: oldDe._id
            , name: oldDe.naming[0].designation
        }
        , diff: diff
    };
    var auditItem = new CdeAudit(message);
    auditItem.save();
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

exports.removeAttachmentLinks = function (id) {
    adminItemSvc.removeAttachmentLinks(id, DataElement);
};

exports.setAttachmentApproved = function (id) {
    adminItemSvc.setAttachmentApproved(id, DataElement);
};

exports.byOtherId = function (source, id, cb) {
    DataElement.find({"archived": null}).elemMatch("ids", {"source": source, "id": id}).exec(function (err, cdes) {
        if (cdes.length > 1) cb("Multiple results, returning first", cdes[0]);
        else cb(err, cdes[0]);
    });
};

exports.fileUsed = function (id, cb) {
    adminItemSvc.fileUsed(id, DataElement, cb);
};

exports.findCurrCdesInFormElement = function (allCdes, cb) {
    DataElement.find({archived: null}, "tinyId version").where("tinyId").in(allCdes).exec(function (err, cdes) {
        cb(err, cdes);
    });
}