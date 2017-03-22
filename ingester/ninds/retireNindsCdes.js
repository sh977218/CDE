var async = require('async'),
    mongo_cde = require('../../modules/cde/node-js/mongo-cde'),
    DataElement = mongo_cde.DataElement
    ;
var retired = 0;
DataElement.find({
    'imported': {$lt: new Date('12/15/2016')},
    'sources.sourceName': 'NINDS',
    'classification.stewardOrg.name': 'NINDS',
    'archived': false
}).exec(function (err, cdes) {
    if (err) throw err;
    else {
        async.forEach(cdes, function (cde, doneOneCde) {
            cde.registrationState.registrationStatus = 'Retired';
            cde.registrationState.administrativeNote = "Not present in import from " + new Date('12/15/2016');
            cde.save(function (error) {
                if (error) throw error;
                else {
                    retired++;
                    console.log('retired: ' + retired);
                    doneOneCde();
                }
            })
        }, function doneAllCdes() {
            process.exit(1);
        })
    }
});
