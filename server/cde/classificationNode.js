const mongo_cde = require('./mongo-cde');
const authorizationShared = require('@std/esm')(module)('../../shared/system/authorizationShared.js');
const classificationShared = require('@std/esm')(module)('../../shared/system/classificationShared.js');

exports.moveClassifications = function (req, cb) {
    mongo_cde.byTinyIdList([req.body.cdeSource.tinyId, req.body.cdeTarget.tinyId], function (err, cde) {
        var source = null;
        var destination = null;
        if (cde[0].tinyId === req.body.cdeSource.tinyId) {
            source = cde[0];
            destination = cde[1];
        } else {
            source = cde[1];
            destination = cde[0];
        }
        if (!authorizationShared.isOrgCurator(req.user, source.stewardOrg.name)) {
            cb(403, null);
            return;
        }
        classificationShared.transferClassifications(source, destination);
        destination.markModified('classification');
        source.save(cb);
    });
};
