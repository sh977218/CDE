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
                for (var i = 0; i < forms.length; i++) {
                    var form = forms[i];
                    if (form.subDomainName && form.subDomainName.indexOf('See "CRF Search" to find all Activities of Daily Living/Performance forms under Subdomain option') != -1)
                        form.subDomainName = 'Activities of Daily Living/Performance';
                    if (form.crfModuleGuideline === 'Alcohol and Tobacco Use') {
                        form.subDomainName = 'Epidemiology/Environmental History';
                    }
                    if (form.domainName !== 'NIH Resources')
                        allForms.push(form);
                }
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