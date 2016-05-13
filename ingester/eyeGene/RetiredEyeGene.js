var async = require('async'),
    DataElement = require('./../createConnection').DataElementModel,
    mongo_cde = require('../../modules/cde/node-js/mongo-cde'),
    elastic = require('../../modules/cde/node-js/elastic')
    ;

var user = {username: 'BatchLoader'};
var deCounter = 0;
DataElement.find({
    'stewardOrg.name': 'EyeGene',
    archived: null,
    'registrationState.registrationStatus': {$ne: "Retired"}
}, function (err, DEs) {
    if (err) throw err;
    async.forEach(DEs, function (de, doneOneDe) {
        de.get('registrationState').registrationStatus = 'Retired';
        de.updatedBy = user;
        de.updated = new Date().toJSON();
        de.markModified('registrationState');
        de.save(function () {
            elastic.updateOrInsert(de);
            deCounter++;
            console.log('deCounter: ' + deCounter);
            doneOneDe();
        });
/*
        mongo_cde.update(de.toObject(), user, function () {
            deCounter++;
            console.log('deCounter: ' + deCounter);
            doneOneDe();
        });
*/
    }, function doneAllDes() {
        console.log('finished all. de count:' + deCounter);
        process.exit(1);
    });
});