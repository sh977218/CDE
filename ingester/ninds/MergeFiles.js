var fs = require('fs'),
    async = require('async');
var tasks = [];
var allForms = [];
for (var i = 1; i < 27; i++) {
    var task = "nindsFormsChrist" + i + ".json";
    tasks.push(task);
}

function compare(a, b) {
    if (a.crfModuleGuideline < b.crfModuleGuideline)
        return -1;
    if (a.crfModuleGuideline > b.crfModuleGuideline)
        return 1;
    return 0;
}
async.eachSeries(tasks, function (file, fileCallback) {
        fs.readFile(__dirname + '/input/' + file, 'utf8', function (err, data) {
            if (err) throw err;
            else {
                var forms = JSON.parse(data);
                allForms = allForms.concat(forms);
                fileCallback();
            }
        })
    }, function doneAllFiles() {
        allForms.sort(compare);
        fs.appendFile(__dirname + "/input/UnformattedNindsForms.json", JSON.stringify(allForms), "utf8", function (err) {
            if (err) console.log(err);
            else {
                console.log("finish all forms and save to input/UnformattedNindsForms.json");
            }
        })
    }
)