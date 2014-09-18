var mongo_data_cde = require('../../cde/node-js/mongo-cde')
    , mongo_data_system = require('./mongo-data') 
    , usersvc = require('../../system/node-js/usersrvc')
    , classificationShared = require('../shared/classificationShared')
    , daoManager = require('./moduleDaoManager')
;

var classification = this;

exports.cdeClassification = function(body, action, cb) {
    this.saveCdeClassif = function(err, cde) {   
        if (err) {
            if (cb) cb(err);
            return;
        }
        classification.cde.markModified('classification');
        classification.cde.save(function() {
            if (cb) cb(err);
        });            
    };    
    daoManager.getDaoList().forEach(function(dao) {
        dao.byId(body.cdeId, function(err, cde) {
            classification.cde = cde;
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

            if( !(body.categories instanceof Array) ) {
                body.categories = [body.categories];
            }

            if (action === classificationShared.actions.create) classificationShared.addCategory(steward.object, body.categories, classification.saveCdeClassif);
            if (action === classificationShared.actions.delete) {
                classificationShared.modifyCategory(steward.object, body.categories, {type:"delete"}, classification.saveCdeClassif);

                // Delete the organization from classificaiton if organization doesn't have any descendant elements.
                if( steward.object.elements.length === 0 ) {
                    classificationShared.removeClassification( cde, body.orgName );
                }
            }
        });     
    });    
};

exports.modifyOrgClassification = function(request, action, callback) {
    if( !(request.categories instanceof Array) ) {
        request.categories = [request.categories];    
    }    
    mongo_data_system.orgByName(request.orgName, function(stewardOrg) {
        var fakeTree = {elements: stewardOrg.classifications};
        classificationShared.modifyCategory(fakeTree, request.categories, {type: action, newname: request.newname});
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
                        var cde = result[i];
                        var steward = classificationShared.findSteward(cde, request.orgName);   
                        classificationShared.modifyCategory(steward.object, request.categories, {type: action, newname: request.newname});
                        cde.markModified("classification");
                        cde.save(function(err) {
                        });
                    }
                });
            });            
            if(callback) callback(err, stewardOrg);
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

exports.classifyEntireSearch = function(req) {
    console.log(req);
};