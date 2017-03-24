var async = require('async'),
    MigrationNindsModel = require('./../createMigrationConnection').MigrationNindsModel,
    mongo_cde = require('../../modules/cde/node-js/mongo-cde'),
    DataElement = mongo_cde.DataElement
    ;

var cdeCounter = 0;

var stream = MigrationNindsModel.find({}).stream();
stream.on('data', function (ninds) {
    stream.pause();
    if (ninds && ninds.get('cdes').length > 0) {
        async.forEachSeries(ninds.get('cdes'), function (cde, doneOneCde) {
            if (cde.inputRestrictions === 'Free-Form Entry' &&
                ( cde.dataType === 'Numeric Values' ||
                cde.dataType === 'Numeric values' ||
                cde.dataType === 'Date or Date & Time' )) {
                DataElement.find({
                    'sources.sourceName': 'NINDS',
                    archived: false, 'ids.id': cde.cdeId,
                    "registrationState.registrationStatus": {$not: /Retired/}
                }, function (err, existingCdes) {
                    if (err) throw err;
                    if (existingCdes.length === 0) {
                        throw ('Cannot find cde with id: ' + cde.cdeId);
                    } else if (existingCdes.length === 1) {
                        var existingCde = existingCdes[0];
                        if (cde.dataType === 'Numeric Values' || cde.dataType === 'Numeric values') {
                            existingCde.valueDomain.datatype = 'Number';
                        } else if (cde.dataType === 'Date or Date & Time') {
                            existingCde.valueDomain.datatypeDate = {format: ''};
                        }
                        existingCde.save(function (e) {
                            if (e) throw e;
                            else {
                                cdeCounter++;
                                console.log("cdeCounter: " + cdeCounter);
                                doneOneCde();
                            }
                        });
                    }
                    else throw(existingCdes.length + ' cdes found, ids.id:' + cde.cdeId);
                });
            }
            else doneOneCde();
        }, function doneAllCdes() {
            stream.resume();
        });
    } else stream.resume();
});

stream.on('end', function () {
    process.exit(1);
});