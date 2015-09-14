var fs = require('fs'),
    async = require('async');
var tasks = [];
var allForms = [];
var excluString = ['See "CRF Search" to find all Imaging forms under Subdomain option.',
    'See "CRF Search" to find all Non-Imaging forms under Subdomain option.',
    'See "CRF Search" to find Surgeries and Other Procedures forms under Subdomain option.',
    'Note: The General CDE Standards contain additional useful CRF Modules and CDEs for this sub-domain.',
    'Note: The General CDE Standards contain additional useful CRF Modules and CDEs for this category of data.'];
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
                    for (var j = 0; j < excluString.length; j++) {
                        var k = form.subDomainName.indexOf(excluString[j]);
                        if (k != -1) {
                            form.subDomainName = form.subDomainName.substr(0, k);
                        }
                    }
                    if (form.domainName !== 'NIH Resources')
                        allForms.push(form);
                }
                fileCallback();
            }
        })
    }, function doneAllFiles() {
        allForms.sort(compare);
        fs.writeFile(__dirname + "/input/UnformattedNindsForms.json", JSON.stringify(allForms), "utf8", function (err) {
            if (err) console.log(err);
            else {
                console.log("finish all forms and save to input/UnformattedNindsForms.json");
            }
        })
    }
)