var start = new Date().getTime();

var fs = require('fs'),
    crypto = require('crypto'),
    async = require('async');

var unmergedForms;

addClassification = function (existingForm, unmergedForm) {
    var existingDiseases = existingForm.classification[0].elements[0].elements;
    var unmergedDisease = unmergedForm.classification[0].elements[0].elements[0];
    var unmergedSubDisease = unmergedForm.classification[0].elements[0].elements[0].elements[0];
    var mergeDisease = true;
    for (var i = 0; i < existingDiseases.length; i++) {
        var existingDisease = existingDiseases[i];
        if (existingDisease.name === unmergedDisease.name) {
            mergeDisease = false;
            if (existingDisease.elements.indexOf(unmergedSubDisease) != -1)
                existingDisease.elements.push(unmergedSubDisease);
        }
    }
    if (mergeDisease) {
        existingDiseases.push(unmergedDisease);
    }
}

getHash = function (f) {
    var md5sum = crypto.createHash('md5');
    var cdesStr = "";
    f.formElements[0].formElements.forEach(function (q) {
        if (q == undefined)
            console.log("bug");
        if (!q.hasOwnProperty("cde"))
            console.log("bug");
        if (!q.cde.hasOwnProperty("cdeId"))
            console.log("bug");
        cdesStr = cdesStr + q.cde.cdeId;
    })
    var copy = f.isCopyrighted === "true" ? "true" : f.referenceDocuments[0].uri;
    var s = f.naming[0].designation + copy + cdesStr;
    return md5sum.update(s).digest('hex');
};

fs.readFile(__dirname + '/newForms.json', 'utf8', function (err, data) {
    if (err) throw err;
    else {
        var allForms = {};
        unmergedForms = JSON.parse(data);
        unmergedForms.forEach(function (unmergedForm) {
            var hash = getHash(unmergedForm);
            if (allForms[hash] === null || allForms[hash] === undefined) {
                allForms[hash] = unmergedForm;
            }
            else {
                var existingForm = allForms[hash];
                addClassification(existingForm, unmergedForm);
            }
        })
        console.log("done");
    }
})