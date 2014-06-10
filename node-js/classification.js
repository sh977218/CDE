var mongo_data = require('../node-js/mongo-data')
, classification = require('../shared/classification');

exports.removeOrgClassification = function(request, callback) {
    //Org.findOne({"name": request.orgName}).exec(function (err, stewardOrg) {     
    mongo_data.orgByName(request.orgName, function(stewardOrg) {
        classification.deleteCategory(stewardOrg.classifications, request.categories);
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
                    var steward = classification.findSteward(cde, request.orgName);   
                    classification.deleteCategory(steward.object.elements, request.categories);
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
    //Org.findOne({"name": body.orgName}).exec(function(err, stewardOrg) {
    mongo_data.orgByName(body.orgName, function(stewardOrg) {
        classification.addCategory(stewardOrg.classifications, categories);
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
    //DataElement.findOne({'_id': body.cdeId}).exec(function (err, cde) {
    mongo_data.cdeById(body.cdeId, function(err, cde) {
        cdeClassif.cde = cde;
        var steward = classification.findSteward(cde, body.orgName);
        if (!steward) {
            cde.classification.push({
                stewardOrg: {
                    name: body.orgName
                }
                , elements: []
            });
            steward = classification.findSteward(cde, body.orgName);
        }        
        if (action === "add") classification.addCategory(steward.object.elements, body.categories, cdeClassif.saveCdeClassif);
        if (action === "remove") classification.deleteCategory(steward.object.elements, body.categories, cdeClassif.saveCdeClassif);
    });     
};