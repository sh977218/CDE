var fs = require('fs'),
    async = require('async');
var tasks = [];
var allForms = [];
var excluString = ['\nSee "CRF Search" to find all Imaging forms under Subdomain option.',
    '\nSee "CRF Search" to find all Non-Imaging forms under Subdomain option.',
    '\nSee "CRF Search" to find Surgeries and Other Procedures forms under Subdomain option.',
    '\nNote: The General CDE Standards contain additional useful CRF Modules and CDEs for this sub-domain.',
    '\nNote: The General CDE Standards contain additional useful CRF Modules and CDEs for this category of data.',
    '\nNote: Also refer to Outcomes and End Points for additional measures recommended for assessing neurological impairment and functional status.',
    '\nThe NINDS strongly encourages researchers to use these NIH-developed materials for NINDS-sponsored research, when appropriate. Utilization of these resources will enable greater consistency for NINDS-sponsored research studies. These tools are free of charge.'];
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
                    if (form.cdes.length > 0)
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
);