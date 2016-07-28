var async = require('async'),
    mongo_cde = require('../../modules/cde/node-js/mongo-cde'),
    DataElement = mongo_cde.DataElement,
    elastic = require('../../modules/cde/node-js/elastic')
    ;

var user = {username: 'BatchLoader'};
var deCounter = 0;
DataElement.find({
    'classification.stewardOrg.name': 'PhenX',
    archived: null,
    'registrationState.registrationStatus': {$ne: "Retired"}
}, function (err, DEs) { 
    if (err) throw err;
    async.forEach(DEs, function (de, doneOneDe) {
        de.source = 'LOINC';
        de.stewardOrg.name = 'LOINC';
        de.updatedBy = user;
        de.updated = new Date().toJSON();
        if (de.properties) {
            de.properties.forEach(function (p) {
                if (p.key === 'PhenX Variables') {
                    p.source = 'PhenX';
                }
                else if (p.key === 'LOINC Fields')
                    p.source = 'LOINC';
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