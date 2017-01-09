var async = require('async');
var mongo_cde = require('../../modules/cde/node-js/mongo-cde');
var DataElement = mongo_cde.DataElement;

var cdeCount = 0;
DataElement.find({'classification.stewardOrg.name': 'NCI', archived: null}).exec(function (err, cdes) {
    if (err) {
        throw err;
    } else {
        async.forEach(cdes, function (cde, doneOneCde) {
            cde.classification = cde.get('classification').filter(function (c) {
                return c.stewardOrg.name !== 'NCI';
            });
            cde.markModified('classification');
            cde.save(function (err) {
                if (err) throw err;
                cdeCount++;
                console.log('cdeCount: ' + cdeCount);
                doneOneCde();
            })
        }, function doneAllCdes() {
            console.log('Finished all.');
            process.exit(1);
        })
    }
});
