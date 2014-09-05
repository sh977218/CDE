var mongo_data_cde = require('../../cde/node-js/mongo-cde')
    , mongo_data_system = require('./mongo-data') 
    , usersvc = require('../../system/node-js/usersrvc')
    , classificationShared = require('../shared/classificationShared');

exports.cdeClassification = function(body, action, cb) {
    var cdeClassif = this;
    this.saveCdeClassif = function(err, cde) {   
        if (err) {
            if (cb) cb(err);
            return;
        }
        cdeClassif.cde.markModified('classification');
        cdeClassif.cde.save(function() {
            if (cb) cb(err);
        });            
    };
    mongo_data_cde.byId(body.cdeId, function(err, cde) {
        cdeClassif.cde = cde;
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
        
        if (action === classificationShared.actions.create) classificationShared.addCategory(steward.object, body.categories, cdeClassif.saveCdeClassif);
        if (action === classificationShared.actions.delete) {
            classificationShared.modifyCategory(steward.object, body.categories, {type:"delete"}, cdeClassif.saveCdeClassif);
            
            // Delete the organization from classificaiton if organization doesn't have any descendant elements.
            if( steward.object.elements.length === 0 ) {
                classificationShared.removeClassification( cde, body.orgName );
            }
        }
    });     
};