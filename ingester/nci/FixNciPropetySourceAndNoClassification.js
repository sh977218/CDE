var async = require('async');
var DataElementModel = require('../../modules/cde/node-js/mongo-cde').DataElement;

var today = new Date();
var beforeNow = new Date();
beforeNow.setHours(beforeNow.getHours() - 8);
var user = {username: 'BatchLoader'};
var deCounter = 0;

var query = {
    $and: [{
        'stewardOrg.name': 'NCI',
        'archived': false,
        'registrationState.registrationStatus': {$ne: "Retired"}
    }, {
        $or: [{'updated': {$exists: false}}, {
            'updated': {$lt: beforeNow}
        }]
    }]
};

DataElementModel.count(query, function(err, count) {
    if (err) throw err;
    console.log(count + " CDEs left");
});

DataElementModel.find(query).limit(5000).exec(function (err, DEs) {
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



