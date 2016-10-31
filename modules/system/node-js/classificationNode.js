var mongo_data_cde = require('../../cde/node-js/mongo-cde')
    , mongo_data_system = require('./mongo-data')
    , classificationShared = require('../shared/classificationShared')
    , daoManager = require('./moduleDaoManager')
    , adminItemSvc = require("./adminItemSvc")
    , elastic = require('./elastic')
    ;

var classification = this;

classification.saveCdeClassif = function(err, cde, cb) {
    if (err) {
        if (cb) cb(err);
        return;
    }
    cde.classification.forEach(function(steward, i) {
        if (steward.elements.length === 0) {
            cde.classification.splice(i, 1);
        }
    });
    cde.updated = new Date();
    cde.markModified('classification');
    cde.save(function() {
        if (cb) cb(err);
    });
};

exports.eltClassification = function (body, action, dao, cb) {
    var classify = function (steward, cde) {
        if( !(body.categories instanceof Array) ) {
            body.categories = [body.categories];
        }
        if (action === classificationShared.actions.create) {
            classificationShared.addCategory(steward.object, body.categories, function(err) {
                classification.saveCdeClassif(err, cde, cb);
            });
        } else if (action === classificationShared.actions.delete) {
            classificationShared.modifyCategory(steward.object, body.categories, {type:"delete"}, function(err) {
                classification.saveCdeClassif(err, cde, cb);
            });
        }

    };

    var  findElements = function(err, cde) {
        if (!cde) return;
        var steward = classificationShared.findSteward(cde, body.orgName);
        if (!steward) {
            mongo_data_system.orgByName(body.orgName, function(stewardOrg) {
                var classifOrg = {
                    stewardOrg: {
                        name: body.orgName
                    },
                    elements: []
                };

                if (stewardOrg.workingGroupOf) classifOrg.workingGroup = true;
                if (!cde.classification) cde.classification = [];
                cde.classification.push(classifOrg);
                steward = classificationShared.findSteward(cde, body.orgName);
                classify(steward, cde);
            });
        } else classify(steward, cde);
    };
    if (body.cdeId && dao.byId)
        dao.byId(body.cdeId, findElements);
    if (body.tinyId && (!body.version) && dao.eltByTinyId)
        dao.eltByTinyId(body.tinyId, findElements);
    if (body.tinyId && body.version && dao.byTinyIdAndVersion)
        dao.byTinyIdAndVersion(body.tinyId, body.version, findElements);
};

exports.modifyOrgClassification = function(request, action, callback) {
    if( !(request.categories instanceof Array) ) {
        request.categories = [request.categories];
    }
    mongo_data_system.orgByName(request.orgName, function(stewardOrg) {
        var fakeTree = {elements: stewardOrg.classifications};
        classificationShared.modifyCategory(fakeTree, request.categories, {type: action, newname: request.newname}, function() {
            stewardOrg.markModified("classifications");
            stewardOrg.save(function (err) {
                var query = {"classification.stewardOrg.name": request.orgName};
                for (var i = 0; i<request.categories.length; i++) {
                    var key = "classification";
                    for (var j = 0; j<=i; j++) key += ".elements";
                    key += ".name";
                    query[key] = request.categories[i];
                }
                daoManager.getDaoList().forEach(function(dao) {
                    dao.query(query, function (err, result) {
                        result.forEach(function(elt) {
                            var steward = classificationShared.findSteward(elt, request.orgName);
                            classificationShared.modifyCategory(steward.object, request.categories,
                                {type: action, newname: request.newname}, function () {
                                    classification.saveCdeClassif("", elt);
                                });
                        });
                        if (result.length > 0) {
                            mongo_data_system.addToClassifAudit({
                                date: new Date()
                                , user: {
                                    username: "unknown"
                                }
                                , elements: result.map(function(e){return {tinyId: e.tinyId, eltType: dao.type};})
                                , action: action
                                , path: [request.orgName].concat(request.categories)
                                , newname: request.newname
                            });
                        }
                    });
                });
                if(callback) callback(err, stewardOrg);
            });
        });
    });
};

exports.addOrgClassification = function(body, cb) {
    if( !(body.categories instanceof Array) ) {
        body.categories = [body.categories];
    }

    mongo_data_system.orgByName(body.orgName, function(stewardOrg) {
        var fakeTree = {elements: stewardOrg.classifications};
        classificationShared.addCategory(fakeTree, body.categories);
        stewardOrg.markModified("classifications");
        stewardOrg.save(cb);
    });
};

exports.classifyCdesInBoard = function(req, cb) {
    var boardId = req.body.boardId;
    var newClassification = req.body.newClassification;

    var action = function(id, actionCallback) {
        var classifReq = {
            orgName: newClassification.orgName
            , categories: newClassification.categories
            , cdeId: id
        };
        classification.eltClassification(classifReq, classificationShared.actions.create, actionCallback);
    };
    mongo_data_cde.boardById(boardId, function(err, board) {
        if (err) return cb(err);
        if (!board) return cb("No such board");
        var tinyIds = board.pins.map(function(cde) {return cde.deTinyId;});
        mongo_data_cde.cdesByTinyIdList(tinyIds, function(err, cdes) {
            var ids = cdes.map(function(cde) {return cde._id;});
            adminItemSvc.bulkAction(ids, action, cb);
            mongo_data_system.addToClassifAudit({
                date: new Date()
                , user: {
                    username: req.user.username
                }
                , elements: cdes.map(function(e){return {tinyId: e.tinyId};})
                , action: "reclassify"
                , path: [newClassification.orgName].concat(newClassification.categories)
            });
        });
    });
};

exports.classifyEntireSearch = function(req, cb) {
    var action = function(id, actionCallback) {
        var classifReq = {
            orgName: req.body.newClassification.orgName
            , categories: req.body.newClassification.categories
            , tinyId: id
        };
        classification.eltClassification(classifReq, classificationShared.actions.create, actionCallback);
    };
    var query = elastic.buildElasticSearchQuery(req.body.user, req.body.query);
    elastic.elasticsearch(query, req.body.itemType, function(err, result) {
        var ids = result.cdes.map(function(cde) {return cde.tinyId;});
        adminItemSvc.bulkAction(ids, action, cb);
        mongo_data_system.addToClassifAudit({
            date: new Date()
            , user: {
                username: req.user.username
            }
            , elements: result.cdes.map(function(e){return {tinyId: e.tinyId};})
            , action: "reclassify"
            , path: [req.body.newClassification.orgName].concat(req.body.newClassification.categories)
        });
    });
};