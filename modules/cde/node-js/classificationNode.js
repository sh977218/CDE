var mongo_data_cde = require('./mongo-cde')
    , mongo_data_system = require('../../system/node-js/mongo-data') 
    , usersvc = require('../../system/node-js/usersrvc')
    , classificationShared = require('../../system/shared/classificationShared.js');

exports.moveClassifications = function(request, cb) {
    mongo_data_cde.cdesByTinyIdList([request.body.cdeSource.tinyId, request.body.cdeTarget.tinyId], function(err, cde) {
        var source = null;
        var destination = null;
        if (cde[0].tinyId === request.body.cdeSource.tinyId) {
            source = cde[0];
            destination = cde[1];
        } else {
            source = cde[1];
            destination = cde[0];            
        }
        if (!usersvc.isCuratorOf(request.user, source.stewardOrg.name)) {
            res.status(403).end();
            return;
        }              
        classificationShared.transferClassifications(source, destination);
        destination.markModified('classification');
        source.save(cb);
    });
 };
 