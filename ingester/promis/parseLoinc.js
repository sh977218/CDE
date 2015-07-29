var csv = require('csv')
    , fs = require('fs');
var promisDir = process.argv[2];
console.log("pre parse");
var loincCsv = fs.readFileSync(promisDir + "/loinc.csv");
console.log("parsed");

csv.parse(loincCsv, function(err, data){
    var loincMap = data
        .filter(function(elt){return elt[18];})
        .map(function(elt){
            return {loincCode: elt[0], name: elt[18], name2: elt[1], sourceId: elt[19]}
        });
    fs.writeFileSync(promisDir + '/loinc.json', JSON.stringify(loincMap));
    console.log("Loaded");
});