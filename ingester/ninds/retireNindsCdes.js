var mongo_cde = require('../../modules/cde/node-js/mongo-cde'),
    DataElement = mongo_cde.DataElement
    ;
var retired = 0;

function doStream() {
    var stream = DataElement.find({
        'imported': {$lt: new Date('12/15/2016')},
        'sources.sourceName': 'NINDS',
        'classification.stewardOrg.name': 'NINDS',
        'archived': null
    }).stream();
    stream.on('error', function (err) {
        console.log(err);
        process.exit(1);
    });
    stream.on('close', function () {
        console.log('retired: ' + retired);
        process.exit(1);
    });
    stream.on('data', function (retireCde) {
        stream.pause();
        retireCde.registrationState.registrationStatus = 'Retired';
        retireCde.registrationState.administrativeNote = "Not present in import from " + new Date('12/15/2016');
        retireCde.save(function (error) {
            if (error) throw error;
            else {
                retired++;
                console.log('retired: ' + retired);
                stream.resume();
            }
        })
    });
}

doStream();
