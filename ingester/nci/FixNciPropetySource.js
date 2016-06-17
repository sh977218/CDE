var async = require('async'),
    mongo_cde = require('../../modules/cde/node-js/mongo-cde'),
    DataElement = mongo_cde.DataElement,
    elastic = require('../../modules/cde/node-js/elastic')
    ;

var user = {username: 'BatchLoader'};
var deCounter = 0;
DataElement.find({
    'stewardOrg.name': 'NCI',
    archived: null,
    'registrationState.registrationStatus': {$ne: "Retired"}
}, function (err, DEs) {
    if (err) throw err;
    async.forEach(DEs, function (de, doneOneDe) {
        de.source = 'caDSR';
        de.updatedBy = user;
        de.updated = new Date().toJSON();
        if (!de.classification || de.classification.length === 0)
            de.classification = [{
                steward: {name: 'NCI'},
                elements: []
            }];
        if (de.properties) {
            de.properties.forEach(function (p) {
                p.source = 'caDSR';
            })
        }
        de.save(function () {
            elastic.updateOrInsert(de, function () {
                deCounter++;
                console.log('deCounter: ' + deCounter);
                doneOneDe();
            });
        });
    }, function doneAllDes() {
        console.log('finished all. de count:' + deCounter);
        process.exit(1);
    });
});