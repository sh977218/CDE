var mongo_cde = require('../../modules/cde/node-js/mongo-cde');
var DataElement = mongo_cde.DataElement;

var cdeCount = 0;
var stream = DataElement.find({'classification.stewardOrg.name': 'NCI', archived: false}).stream();
stream.on('data', function (cde) {
    stream.pause();
    cde.classification = cde.get('classification').filter(function (c) {
        return c.stewardOrg.name !== 'NCI';
    });
    cde.markModified('classification');
    cde.save(function (err) {
        if (err) throw err;
        cdeCount++;
        console.log('cdeCount: ' + cdeCount);
        stream.resume();
    })
});
stream.on('error', function (error) {
    if (error) throw error;
    process.exit(1);
});
stream.on('end', function () {
    console.log('Finished all.');
    process.exit(1);
});