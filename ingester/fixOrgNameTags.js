var async = require('async'),
    OrgModel = require('../modules/system/node-js/mongo-data').Org;

var orgCount = 0;
OrgModel.find({}).exec(function (findOrgError, orgs) {
    if (findOrgError) throw findOrgError;
    else {
        async.forEach(orgs, function (org, doneOneOrg) {
            org.nameTags = org.get('nameContexts');
            org.markModified('nameTags');
            org.save(function (saveOrgError) {
                if (saveOrgError) throw saveOrgError;
                else {
                    orgCount++;
                    console.log('orgCount: ' + orgCount);
                    doneOneOrg();
                }
            })
        }, function doneAllOrgs() {
            console.log('finished all orgs. orgCount: ' + orgCount);
            process.exit(1);
        })
    }
});