const boardDb = require('../board/boardDb');
const mongo_data_system = require('../system/mongo-data');
const classificationShared = require('@std/esm')(module)('../../shared/system/classificationShared');
const daoManager = require('../system/moduleDaoManager');
const adminItemSvc = require("../system/adminItemSvc");
const elastic = require('../system/elastic');
const async = require('async');
const logging = require('../system/logging.js');

var classification = this;

classification.saveCdeClassif = function (err, elt, cb) {
    if (err) {
        if (cb) cb(err);
        return;
    }
    elt.classification.forEach(function (steward, i) {
        if (steward.elements.length === 0) {
            elt.classification.splice(i, 1);
        }
    });
    elt.updated = new Date();
    elt.markModified('classification');
    elt.save(cb);
};

exports.eltClassification = function (body, action, dao, cb) {
    var classify = function (steward, elt) {
        if (!(body.categories instanceof Array)) {
            body.categories = [body.categories];
        }
        if (action === classificationShared.actions.create) {
            classificationShared.addCategory(steward.object, body.categories, function (err) {
                classification.saveCdeClassif(err, elt, cb);
            });
        } else if (action === classificationShared.actions.delete) {
            classificationShared.modifyCategory(steward.object, body.categories, {type: "delete"}, function (err) {
                classification.saveCdeClassif(err, elt, cb);
            });
        }

    };

    var findElements = function (err, elt) {
        if (!elt) return cb("can not elt");
        var steward = classificationShared.findSteward(elt, body.orgName);
        if (!steward) {
            mongo_data_system.orgByName(body.orgName, function (err, stewardOrg) {
                var classifOrg = {
                    stewardOrg: {
                        name: body.orgName
                    },
                    elements: []
                };

                if (stewardOrg.workingGroupOf) classifOrg.workingGroup = true;
                if (!elt.classification) elt.classification = [];
                elt.classification.push(classifOrg);
                steward = classificationShared.findSteward(elt, body.orgName);
                classify(steward, elt);
            });
        } else classify(steward, elt);
    };
    if (body.cdeId && dao.byId)
        dao.byId(body.cdeId, findElements);
    if (body.tinyId && (!body.version) && dao.eltByTinyId)
        dao.eltByTinyId(body.tinyId, findElements);
    if (body.tinyId && body.version && dao.byTinyIdAndVersion)
        dao.byTinyIdAndVersion(body.tinyId, body.version, findElements);
};

exports.isInvalidatedClassificationRequest = function (req) {
    if (!req.body || !req.body.eltId || !req.body.categories || !(req.body.categories instanceof Array) || !req.body.orgName)
        return "Bad Request";
    else return false;
};

exports.addClassification = function (body, dao, cb) {
    if (!dao.byId) {
        cb("dao.byId is undefined");
        logging.log(null, "dao.byId is undefined" + dao);
        return;
    }
    dao.byId(body.eltId, function (err, elt) {
        if (err) return cb(err);
        if (!elt) return cb("Can not find elt with _id: " + body.eltId);
        let steward = classificationShared.findSteward(elt, body.orgName);
        if (!steward) {
            elt.classification.push({
                stewardOrg: {name: body.orgName},
                elements: []
            });
            steward = classificationShared.findSteward(elt, body.orgName);
        }
        classificationShared.addCategory(steward.object, body.categories, function (result) {
            elt.updated = new Date();
            elt.markModified("classification");
            elt.save(function (err) {
                if (err) cb(err);
                else cb(null, result);
            });
        });
    });
};

exports.removeClassification = function (body, dao, cb) {
    if (!dao.byId) {
        cb("Element id is undefined");
        logging.log(null, "Element id is undefined" + dao);
        return;
    }
    dao.byId(body.eltId, function (err, elt) {
        if (err) return cb(err);
        if (!elt) return cb("Can not find elt with _id: " + body.eltId);
        let steward = classificationShared.findSteward(elt, body.orgName);
        classificationShared.removeCategory(steward.object, body.categories, function (e) {
            if (e) return cb(e);
            for (var i = elt.classification.length - 1; i >= 0; i--) {
                if (elt.classification[i].elements.length === 0) {
                    elt.classification.splice(i, 1);
                }
            }
            elt.updated = new Date();
            elt.markModified("classification");
            elt.save(function (err, o) {
                cb(err, o);
            });
        });
    });
};

exports.modifyOrgClassification = function (request, action, callback) {
    if (!(request.categories instanceof Array)) {
        request.categories = [request.categories];
    }
    mongo_data_system.orgByName(request.orgName, function (err, stewardOrg) {
        var fakeTree = {elements: stewardOrg.classifications};
        classificationShared.modifyCategory(fakeTree, request.categories, {
            type: action,
            newname: request.newname
        }, function () {
            stewardOrg.markModified("classifications");
            stewardOrg.save(function (err) {
                var query = {"classification.stewardOrg.name": request.orgName, archived: false};
                for (var i = 0; i < request.categories.length; i++) {
                    var key = "classification";
                    for (var j = 0; j <= i; j++) key += ".elements";
                    key += ".name";
                    query[key] = request.categories[i];
                }
                async.forEachSeries(daoManager.getDaoList(), function (dao, oneDaoDone) {
                    if (dao.query) {
                        dao.query(query, function (err, result) {
                            if (result && result.length > 0) {
                                async.forEachSeries(result, function (elt, doneOne) {
                                    var steward = classificationShared.findSteward(elt, request.orgName);
                                    classificationShared.modifyCategory(steward.object, request.categories,
                                        {type: action, newname: request.newname}, function () {
                                            classification.saveCdeClassif("", elt, doneOne);
                                        });
                                }, function doneAll() {
                                    mongo_data_system.addToClassifAudit({
                                        date: new Date()
                                        , user: {
                                            username: "unknown"
                                        }
                                        , elements: result.map(function (e) {
                                            return {tinyId: e.tinyId, eltType: dao.type};
                                        })
                                        , action: action
                                        , path: [request.orgName].concat(request.categories)
                                        , newname: request.newname
                                    });
                                    oneDaoDone();
                                });
                            } else {
                                oneDaoDone();
                            }
                        });
                    } else {
                        oneDaoDone();
                    }
                }, function allDaosDone() {
                    if (callback) callback(err, stewardOrg);
                });
            });
        });
    });
};

exports.addOrgClassification = function (body, cb) {
    if (!(body.categories instanceof Array)) {
        body.categories = [body.categories];
    }

    mongo_data_system.orgByName(body.orgName, function (err, stewardOrg) {
        var fakeTree = {elements: stewardOrg.classifications};
        classificationShared.addCategory(fakeTree, body.categories);
        stewardOrg.markModified("classifications");
        stewardOrg.save(cb);
    });
};

exports.classifyEltsInBoard = function (req, dao, cb) {
    let boardId = req.body.boardId;
    let newClassification = req.body.newClassification;

    let action = function (id, actionCallback) {
        let classifReq = {
            orgName: newClassification.orgName,
            categories: newClassification.categories,
            cdeId: id
        };
        classification.eltClassification(classifReq, classificationShared.actions.create, dao, actionCallback);
    };
    boardDb.byId(boardId, function (err, board) {
        if (err) return cb(err);
        if (!board) return cb("No such board");
        let tinyIds = board.pins.map(p => p.tinyId);
        dao.byTinyIdList(tinyIds, function (err, cdes) {
            let ids = cdes.map(cde => cde._id);
            adminItemSvc.bulkAction(ids, action, cb);
            mongo_data_system.addToClassifAudit({
                date: new Date(),
                user: {
                    username: req.user.username
                },
                elements: cdes.map(function (e) {
                    return {tinyId: e.tinyId};
                }),
                action: "reclassify",
                path: [newClassification.orgName].concat(newClassification.categories)
            });
        });
    });
};

exports.classifyEntireSearch = function (req, cb) {
    async.each(daoManager.getDaoList(), function (dao, oneDaoDone) {
        let query = elastic.buildElasticSearchQuery(req.body.user, req.body.query);
        elastic.elasticsearch(dao.type, query, req.body.query, function (err, result) {
            if (err) return;
            let ids = result[dao.type + 's'].map(cde => cde.tinyId);

            let action = function (id, actionCallback) {
                let classifReq = {
                    orgName: req.body.newClassification.orgName,
                    categories: req.body.newClassification.categories,
                    tinyId: id
                };
                classification.eltClassification(classifReq, classificationShared.actions.create, dao, actionCallback);
            };

            adminItemSvc.bulkAction(ids, action, oneDaoDone);

            mongo_data_system.addToClassifAudit({
                date: new Date(),
                user: {
                    username: req.user.username
                },
                elements: result[dao.type + 's'].map(e => {
                    return {tinyId: e.tinyId};
                }),
                action: "reclassify",
                path: [req.body.newClassification.orgName].concat(req.body.newClassification.categories)
            });
        });
    }, cb);

};