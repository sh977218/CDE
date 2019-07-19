import { eachSeries } from 'async';
import { parse } from 'csv';
import { readFileSync } from 'fs';
import { byTinyId } from '../server/form/mongo-form';

var count = 0;
function addToCount() {
    count++;
    if (count % 100 === 0) console.log(count);
}

var fileLoc = process.argv[2];
var inFile = readFileSync(fileLoc);
var allProps = [];

parse(inFile, function(err, data) {
   data.splice(0, 1);
    eachSeries(data, function (jsonLine, oneDone) {
        if (jsonLine) {
            if (err) {
                console.log(jsonLine);
                console.log(err);
                process.exit(1);
            } else {
                var tinyId = jsonLine[1];
                var prop = jsonLine[3];
                byTinyId(tinyId, function (err, form) {
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
