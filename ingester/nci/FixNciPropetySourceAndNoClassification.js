var async = require('async'),
    DataElementModel = require('../createConnection').DataElementModel
    ;

var today = new Date();
var user = {username: 'BatchLoader'};
var deCounter = 0;
DataElementModel.find({
    $and: [{
        'stewardOrg.name': 'NCI',
        'archived': null,
        'registrationState.registrationStatus': {$ne: "Retired"}
    }, {
        $or: [{'updated': {$exists: false}}, {
            'updated': {$lt: today}
        }]
    }]
}).exec(function (err, DEs) {
    if (err) throw err;
    async.forEachSeries(DEs, function (de, doneOneDe) {
        de.source = 'caDSR';
        de.updatedBy = user;
        de.updated = today.toJSON();
        if (!de.classification || de.classification.length === 0)
            de.classification = [{
                stewardOrg: {
                    name: 'NCI',
                    elements: []
                },
                elements: []
            }];
        if (de.properties) {
            de.properties.forEach(function (p) {
                p.source = 'caDSR';
            });
        }
        de.save(function (err) {
            if (err) {
                console.log(err);
                process.exit(1);
            }
            else {
                deCounter++;
                console.log('deCounter: ' + deCounter);
                doneOneDe();
            }
        });
    }, function doneAllDes() {
        console.log('finished all. de count:' + deCounter);
        process.exit(0);
    });
});



