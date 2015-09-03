var start = new Date().getTime();

var fs = require('fs'),
    form_schemas = require('../../modules/form/node-js/schemas'),
    mongo_form = require('../../modules/form/node-js/mongo-form'),
    mongoose = require('mongoose'),
    config = require('config'),
    mongo_data_system = require('../../modules/system/node-js/mongo-data'),
    crypto = require('crypto'),
    MongoClient = require('mongodb').MongoClient,
    async = require('async');

var conn = mongoose.createConnection("mongodb://siteRootAdmin:password@localhost:27017/test", {auth: {authdb: "admin"}});
conn.on('error', console.error.bind(console, 'connection error:'));
conn.once('open', function callback() {
    console.log('connected to db');
});
var Form = conn.model('Form', form_schemas.formSchema);

var unmergedForms;
var user = {
    "username": "batchloader"
};

mergeClassificationAndDomain = function (existingForm, unmergedForm) {
    var existingDiseases = existingForm.classification[0].elements[0].elements;
    var unmergedDisease = unmergedForm.classification[0].elements[0].elements[0];
    var unmergedSubDisease = unmergedForm.classification[0].elements[0].elements[0].elements[0];

    var existingDomains = existingForm.classification[0].elements[1].elements;
    var unmergedDomain = unmergedForm.classification[0].elements[1].elements[0];
    var unmergedSubDomain = unmergedForm.classification[0].elements[1].elements[0].elements[0];

    var mergeDisease = true;
    for (var i = 0; i < existingDiseases.length; i++) {
        var existingDisease = existingDiseases[i];
        if (existingDisease.name === 'Amyotrophic Lateral Sclerosis' && unmergedDisease.name === 'Amyotrophic Lateral Sclerosis')
            console.log('yo');
        if (existingDisease.name === unmergedDisease.name) {
            mergeDisease = false;
            if (existingDisease.name === "Traumatic Brain Injury")
                existingDisease.elements.push(unmergedSubDisease);
            else {
                existingDisease.elements[0].elements.push(unmergedDomain);
            }
        }
    }
    if (mergeDisease) {
        existingDiseases.push(unmergedDisease);
    }

    var mergeDomain = true;
    for (var i = 0; i < existingDomains.length; i++) {
        var existingDomain = existingDomains[i];
        if (existingDomain.name === unmergedDomain.name) {
            mergeDomain = false;
            var existingSubDomains = existingDomain.elements;
            var mergeSubDomain = true;
            for (var j = 0; j < existingSubDomains.length; j++) {
                var existingSubDomain = existingSubDomains[j];
                if (existingSubDomain.name === unmergedSubDomain.name)
                    mergeSubDomain = false
            }
            if (mergeSubDomain)
                existingDomain.elements.push(unmergedSubDomain);
        }
    }
    if (mergeDomain) {
        existingDomains.push(unmergedDomain);
    }

}

getHash = function (f) {
    var md5sum = crypto.createHash('md5');
    var cdesStr = "";
    f.formElements[0].formElements.forEach(function (q) {
        cdesStr = cdesStr + q.question.cde.cdeId;
    })
    var copy = f.isCopyrighted === "true" ? "true" : f.referenceDocuments[0].uri;
    var s = f.naming[0].designation + copy + cdesStr;
    return md5sum.update(s).digest('hex');
};
setTimeout(function () {
        fs.readFile(__dirname + '/FormattedNindsForms.json', 'utf8', function (err, data) {
            if (err)
                throw err;
            else {
                var newForms = [];
                var allForms = {};
                unmergedForms = JSON.parse(data);
                unmergedForms.forEach(function (unmergedForm) {
                    var hash = getHash(unmergedForm);
                    if (allForms[hash] === null || allForms[hash] === undefined) {
                        allForms[hash] = unmergedForm;
                    }
                    else {
                        var existingForm = allForms[hash];
                        mergeClassificationAndDomain(existingForm, unmergedForm);
                    }
                })
                var counter = 1;
                async.eachSeries(Object.keys(allForms), function (key, cb) {
                    var f = allForms[key];
                    mongo_form.create(f, user, function (err, newForm) {
                        if (err) {
                            console.log(err);
                            throw err;
                        }
                        else {
                            console.log("form " + counter + " saved in mongo.");
                            counter++;
                            cb();
                        }
                    })
                }, function doneAll() {
                    console.log("loaded all forms into db. cheers!");
                });
            }
        })
    },
    3000
);


