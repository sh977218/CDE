var mongo_data = require('../node-js/mongo-data')
, classificationShared = require('../shared/classification');

exports.removeOrgClassification = function(request, callback) {   
    mongo_data.orgByName(request.orgName, function(stewardOrg) {
        classificationShared.deleteCategory(stewardOrg.classifications, request.categories);
        stewardOrg.markModified("classifications");
        stewardOrg.save(function (err) {
            var query = {"classification.stewardOrg.name": request.orgName};
            for (var i = 0; i<request.categories.length; i++) {
                var key = "classification";
                for (var j = 0; j<=i; j++) key += ".elements";
                key += ".name";
                query[key] = request.categories[i];
            }            
            mongo_data.DataElement.find(query).exec(function(err, result) {
                for (var i = 0; i < result.length; i++) {
                    var cde = result[i];
                    var steward = classificationShared.findSteward(cde, request.orgName);   
                    classificationShared.deleteCategory(steward.object.elements, request.categories);
                    cde.markModified("classification");
                    cde.save(function(err) {
                    });
                };
            });            
            if(callback) callback(err, stewardOrg);
        });
    });    
};

exports.addOrgClassification = function(body, cb) {
    var categories = body.categories;
    mongo_data.orgByName(body.orgName, function(stewardOrg) {
        classificationShared.addCategory(stewardOrg.classifications, categories);
        stewardOrg.markModified("classifications");
        stewardOrg.save(function (err) {
            if(cb) cb(err, stewardOrg);
        });
    });
};

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
    mongo_data.cdeById(body.cdeId, function(err, cde) {
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
        if (action === "add") classificationShared.addCategory(steward.object.elements, body.categories, cdeClassif.saveCdeClassif);
        if (action === "remove") classificationShared.deleteCategory(steward.object.elements, body.categories, cdeClassif.saveCdeClassif);
    });     
};

exports.moveClassifications = function(request, cb) {
    var mongo_data = require('../node-js/mongo-data');
    mongo_data.cdesByUuidList([request.cdeSource.uuid, request.cdeTarget.uuid], function(err, cde) {
         classificationShared.transferClassifications(cde[0], cde[1]);
         cde[1].markModified('classification');
         cde[1].save(cb);
    });
 };