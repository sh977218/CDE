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
                classificationShared.modifyCategory(steward.object, body.categories, {type:"delete"}, classification.cdeClassification.saveCdeClassif);

                // Delete the organization from classificaiton if organization doesn't have any descendant elements.
                if( steward.object.elements.length === 0 ) {
                    classificationShared.removeClassification( cde, body.orgName );
                }
            }
        });     
    });    
};