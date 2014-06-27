var mongo_data = require('../node-js/mongo-data')
, usersvc = require('./usersvc')
, classificationShared = require('../shared/classificationShared');

exports.removeOrgClassification = function(request, callback) {
    if( !(request.categories instanceof Array) ) {
        request.categories = [request.categories];    
    }
    
    mongo_data.orgByName(request.orgName, function(stewardOrg) {
        var fakeTree = {elements: stewardOrg.classifications};
        classificationShared.deleteCategory(fakeTree, request.categories);
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
                    classificationShared.deleteCategory(steward.object, request.categories);
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
    if( !(body.categories instanceof Array) ) {
        body.categories = [body.categories];
    }
    
    mongo_data.orgByName(body.orgName, function(stewardOrg) {
        var fakeTree = {elements: stewardOrg.classifications};
        classificationShared.addCategory(fakeTree, body.categories, cb);
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
        
        if( !(body.categories instanceof Array) ) {
            body.categories = [body.categories];
        }
        
        if (action === "add") classificationShared.addCategory(steward.object, body.categories, cdeClassif.saveCdeClassif);
        if (action === "remove") {
            classificationShared.deleteCategory(steward.object, body.categories, cdeClassif.saveCdeClassif);
            
            // Delete the organization from classificaiton if organization doesn't have any descendant elements.
            if( steward.object.elements.length === 0 ) {
                classificationShared.removeClassification( cde, body.orgName );
            }
        }
    });     
};

exports.moveClassifications = function(request, cb) {
    var mongo_data = require('../node-js/mongo-data');
    mongo_data.cdesByUuidList([request.body.cdeSource.uuid, request.body.cdeTarget.uuid], function(err, cde) {
        var source = null;
        var destination = null;
        if (cde[0].uuid === request.body.cdeSource.uuid) {
            source = cde[0];
            destination = cde[1];
        } else {
            source = cde[1];
            destination = cde[0];            
        }
        if (!usersvc.isCuratorOf(request.user, source.stewardOrg.name)) {
            res.send(403);
            return;
        }              
        classificationShared.transferClassifications(source, destination);
        source.markModified('classification');
        source.save(cb);
    });
 };