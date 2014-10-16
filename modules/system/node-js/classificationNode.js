var mongo_data_cde = require('../../cde/node-js/mongo-cde')
    , mongo_data_system = require('./mongo-data') 
    , usersvc = require('../../system/node-js/usersrvc')
    , classificationShared = require('../shared/classificationShared')
    , daoManager = require('./moduleDaoManager')
    , adminItemSvc = require("./adminItemSvc")    
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

//exports.cdeClassification = function(body, action, cb) {  
//    daoManager.getDaoList().forEach(function(dao) {
//        dao.byId(body.cdeId, function(err, cde) {
//            var steward = classificationShared.findSteward(cde, body.orgName);
//            if (!steward) {
//                cde.classification.push({
//                    stewardOrg: {
//                        name: body.orgName
//                    }
//                    , elements: []
//                });
//                steward = classificationShared.findSteward(cde, body.orgName);
//            }
//
//            if( !(body.categories instanceof Array) ) {
//                body.categories = [body.categories];
//            }
//
//            if (action === classificationShared.actions.create) {
//                classificationShared.addCategory(steward.object, body.categories, function(err) {
//                    classification.saveCdeClassif(err, cde, cb);
//                });
//            } else if (action === classificationShared.actions.delete) {
//                classificationShared.modifyCategory(steward.object, body.categories, {type:"delete"}, function() {
//                    classification.saveCdeClassif("", cde, cb);
//                });
//            }
//        });     
//    });    
//};

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
            classificationShared.modifyCategory(steward.object, body.categories, {type:"delete"}, function() {
                classification.saveCdeClassif("", cde, cb);
            });
        }        
    };
    daoManager.getDaoList().forEach(function(dao) {
        dao.byId(body.cdeId, function(err, cde) {
            var steward = classificationShared.findSteward(cde, body.orgName);
            if (!steward) {
                cde.classification.push({
                    stewardOrg: {
                        name: body.orgName
                    }
                    , elements: []
                });
                steward = classificationShared.findSteward(cde, body.orgName);
            }
            classify(steward, cde);
        });     
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
                            classificationShared.modifyCategory(steward.object, request.categories, {type: action, newname: request.newname}, function() {
                                classification.saveCdeClassif("", elt);     
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
        stewardOrg.save(function (err) {
            if(cb) cb(err, stewardOrg);
        });
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
    adminItemSvc.bulkActionOnSearch(req, action, cb);
};