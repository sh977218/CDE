var mongo_cde = require('../server/cde/mongo-cde');
var DataElement = mongo_cde.DataElement;

var cdeCount = 0;

var stream = DataElement.find({}).stream();

stream.on('data', function (cde) {
    stream.pause();
    cde.sources = [];
    if (cde.source != undefined)
        cde.sources.push({sourceName: cde.source});
    cde.markModified("sources");
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