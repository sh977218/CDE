var mongo_data_cde = require('./mongo-cde')
    , mongo_data_system = require('../../system/node-js/mongo-data') 
    , usersvc = require('../../system/node-js/usersrvc')
    , classificationShared = require('../../system/shared/classificationShared.js');

//exports.addOrgClassification = function(body, cb) {
//    if( !(body.categories instanceof Array) ) {
//        body.categories = [body.categories];
//    }
//    
//    mongo_data_system.orgByName(body.orgName, function(stewardOrg) {
//        var fakeTree = {elements: stewardOrg.classifications};
//        classificationShared.addCategory(fakeTree, body.categories);
//        stewardOrg.markModified("classifications");
//        stewardOrg.save(function (err) {
//            if(cb) cb(err, stewardOrg);
//        });
//    });
//};

exports.moveClassifications = function(request, cb) {
    mongo_data_cde.cdesByUuidList([request.body.cdeSource.uuid, request.body.cdeTarget.uuid], function(err, cde) {
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
 
//exports.modifyOrgClassification = function(request, action, callback) {
//    if( !(request.categories instanceof Array) ) {
//        request.categories = [request.categories];    
//    }    
//    mongo_data_system.orgByName(request.orgName, function(stewardOrg) {
//        var fakeTree = {elements: stewardOrg.classifications};
//        classificationShared.modifyCategory(fakeTree, request.categories, {type: action, newname: request.newname});
//        stewardOrg.markModified("classifications");
//        stewardOrg.save(function (err) {
//            var query = {"classification.stewardOrg.name": request.orgName};
//            for (var i = 0; i<request.categories.length; i++) {
//                var key = "classification";
//                for (var j = 0; j<=i; j++) key += ".elements";
//                key += ".name";
//                query[key] = request.categories[i];
//            }            
//            mongo_data_cde.DataElement.find(query).exec(function(err, result) {
//                for (var i = 0; i < result.length; i++) {
//                    var cde = result[i];
//                    var steward = classificationShared.findSteward(cde, request.orgName);   
//                    classificationShared.modifyCategory(steward.object, request.categories, {type: action, newname: request.newname});
//                    cde.markModified("classification");
//                    cde.save(function(err) {
//                    });
//                };
//            });            
//            if(callback) callback(err, stewardOrg);
//        });   
//    });
//};