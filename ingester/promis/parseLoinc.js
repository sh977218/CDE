// 3

var csv = require('csv')
    , fs = require('fs');
var promisDir = process.argv[2];

var endResult = [];
var count = 0;

function addToCount() {
    count++;
    if (count % 100 === 0) console.log(count);
}

function addToJson(line) {
    csv.parse(line, function (err, data) {
        var loincMap = data
            .filter(function (elt) {
                return elt[18];
            })
            .map(function (elt) {
                return {loincCode: elt[0], name: elt[18], name2: elt[1], sourceId: elt[19]}
            });
        if (loincMap.length > 0) {
            endResult.push(loincMap[0]);
        }
        addToCount();
    });
}


var readline = require('readline');
var stream = require('stream');

var instream = fs.createReadStream(promisDir + "/loinc.csv");
var outstream = new stream;
var rl = readline.createInterface(instream, outstream);

rl.on('line', function (line) {
    addToJson(line);
});

rl.on('close', function () {
    fs.writeFileSync(promisDir + '/loinc.json', JSON.stringify(endResult));
});