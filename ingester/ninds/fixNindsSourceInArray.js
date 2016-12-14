var async = require('async'),
    mongo_cde = require('../../modules/cde/node-js/mongo-cde'),
    DataElement = mongo_cde.DataElement
    ;

let cdeCount = 0;

var stream = DataElement.find({
    archived: null,
    'sources.sourceName': 'NINDS',
    "registrationState.registrationStatus": {$not: /Retired/}
}).stream();
stream.on('error', function (e) {
    console.log(e);
    process.exit(1);
});
stream.on('close', function () {
    console.log('cdeCount: ' + cdeCount);
    process.exit(1);
});
stream.on('data', function (cde) {
    stream.pause();
    cde.naming.forEach(function (n) {
        n.source = 'NINDS';
    });
    cde.properties.forEach(function (p) {
        p.source = 'NINDS';
    });
    cde.referenceDocuments.forEach(function (r) {
        r.source = 'NINDS';
    });
    cde.save(function (e) {
        if (e) process.exit(1);
        else {
            cdeCount++;
            console.log('cdeCount: ' + cdeCount);
            stream.resume();
        }
    })
});
