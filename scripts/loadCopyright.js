var csv = require('csv')
    , fs = require('fs')
    , mongo_form = require('../modules/form/node-js/mongo-form')
    , async = require('async');

var count = 0;
function addToCount() {
    count++;
    if (count % 100 === 0) console.log(count);
}

var fileLoc = process.argv[2];

var allProps = [];

var inFile = fs.readFileSync(fileLoc);

csv.parse(inFile, function(err, data) {
   data.splice(0, 1);
    async.eachSeries(data, function (jsonLine, oneDone) {
        if (jsonLine) {
            if (err) {
                console.log(line);
                console.log(err);
                process.exit(1);
            } else {
                var tinyId = jsonLine[1];
                var prop = jsonLine[3];
                mongo_form.eltByTinyId(tinyId, function (err, form) {
                    if (err) {
                        console.log(err);
                        process.exit(1);
                    }
                    addToCount();
                    if (!form) {
                        console.log("no form for " + tinyId);
                        process.exit(1);
                    }
                    form.properties.push({key: prop, value: true});
                    form.save(function () {
                        console.log(count);
                        oneDone();
                    });
                });
                if (allProps.indexOf(jsonLine[3]) === -1) {
                    allProps.push(jsonLine[3]);
                }
            }
        }
    }, function allDone() {
        console.log("all done. " + count);
        process.exit(0);
    });
});
