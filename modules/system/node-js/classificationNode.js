var mongo_data_cde = require('../../cde/node-js/mongo-cde')
    , mongo_data_system = require('./mongo-data')
    , usersvc = require('../../system/node-js/usersrvc')
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
    cde.markModified('classification');
    cde.save(function() {
        if (cb) cb(err);
    });
};

exports.cdeClassification = function(body, action, cb) {
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
    daoManager.getDaoList().forEach(function(dao) {
        var  findElements = function(err, cde) {
            if (!cde) return;
            var steward = classificationShared.findSteward(cde, body.orgName);
            if (!steward) {
                mongo_data_system.orgByName(body.orgName, function(stewardOrg) {
                    var classifOrg = {
                        stewardOrg: {
                            name: body.orgName
                        }
                        , elements: []
                    };

                    if (stewardOrg.workingGroupOf) classifOrg.workingGroup = true;
                    if (!cde.classification) cde.classification = [];
                    cde.classification.push(classifOrg);
                    steward = classificationShared.findSteward(cde, body.orgName);
                    classify(steward, cde);
                });
            } else classify(steward, cde);
        };
        if (body.cdeId) dao.byId(body.cdeId, findElements);
        if (body.tinyId && (!body.version)) dao.eltByTinyId(body.tinyId, findElements);
        if (body.tinyId && body.version) dao.byTinyIdAndVersion(body.tinyId, body.version, findElements);
    });
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
                    dao.query(query, function(err, result) {
                        for (var i = 0; i < result.length; i++) {
                            var elt = result[i];
                            var steward = classificationShared.findSteward(elt, request.orgName);
                            classificationShared.modifyCategory(steward.object, request.categories,
                                {type: action, newname: request.newname}, function() {
                                classification.saveCdeClassif("", elt);
                            });
                        }
                        if (result.length > 0) {
                            mongo_data_system.addToClassifAudit({
                                date: new Date()
                                , user: {
                                    username: "unknown"
                                }
                                , elements: result.map(function(e){return {tinyId: e.tinyId, eltType: e.formElements?"form":"cde"};})
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

exports.classifyEntireSearch = function(req, cb) {
    var action = function(id, actionCallback) {
        var classifReq = {
            orgName: req.newClassification.orgName
            , categories: req.newClassification.categories
            , cdeId: id
        };
        classification.cdeClassification(classifReq, classificationShared.actions.create, actionCallback);
    };
    var query = elastic.buildElasticSearchQuery(req.user, req.query);
    elastic.elasticsearch(query, req.itemType, function(err, result) {
        var ids = result.cdes.map(function(cde) {return cde._id;});
        adminItemSvc.bulkAction(ids, action, cb);
        mongo_data_system.addToClassifAudit({
            date: new Date()
            , user: {
                username: "unknown"
            }
            , elements: result.cdes.map(function(e){return {tinyId: e.tinyId};})
            , action: "reclassify"
            , path: [req.newClassification.orgName].concat(req.newClassification.categories)
        });
    });
};