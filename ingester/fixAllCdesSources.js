var mongo_cde = require('../modules/cde/node-js/mongo-cde');
var DataElement = mongo_cde.DataElement;

var cdeCount = 0;

var stream = DataElement.find({}).stream();

stream.on('data', function (cde) {
    stream.pause();
    cde.sources = [{sourceName: cde.source}];
    cde.save(function (err) {
        if (err) throw err;
        cdeCount++;
        console.log("cdeCount:" + cdeCount);
        stream.resume();
    })
});

stream.on('error', function (err) {
    if (err) throw err;
});

stream.on('end', function () {
    console.log('end of stream.');
    process.exit(1);
});