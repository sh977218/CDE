var start = new Date().getTime();

var fs = require('fs'),
    mongoose = require('mongoose'),
    config = require('config'),
    mongo_cde = require('../modules/cde/node-js/mongo-cde'),
    mongo_form = require('../modules/form/node-js/mongo-form'),
    form_schemas = require('../modules/form/node-js/schemas'),
    mongo_data_system = require('../modules/system/node-js/mongo-data'),
    async = require('async');


var MongoClient = require('mongodb').MongoClient;
var conn = mongoose.createConnection("mongodb://siteRootAdmin:password@localhost:27017/test", {auth: {authdb: "admin"}});
conn.on('error', console.error.bind(console, 'connection error:'));
conn.once('open', function callback() {
    console.log('connected to db');
});

// Global variables
var globals = {
    orgName: "NINDS"
};

var Form = conn.model('Form', form_schemas.formSchema);

var oldForms;
var user = {
    "username": "batchloader"
};
sameCdes = function (cdes1, cdes2) {
    if (cdes1 === [] && cdes2 === []) {
        return true;
    }
    else if (cdes1.length != cdes2.length) {
        return true;
    }
    else {
        for (var i = 0; i < cdes1.length; i++) {
            if (cdes1[i].cdeId !== cdes2[i].cdeId)
                return false;
        }
    }
}
sameForm = function (newForm, formInList) {
    if (newForm.naming[0].designation.trim() !== formInList.naming[0].designation) {
        return false;
    }
    else if (!sameCdes(newForm.cdes.formInList.cdes)) {
        return false;
    }
    else if (newForm.isCopyrighted !== formInList.isCopyrighted) {
        return false;
    }
    else if (newForm.isCopyrighted === formInList.isCopyrighted) {
        formInList.referenceDocuments.push(newForm.referenceDocuments[0]);
    }
    else return true;
}

addClassification = function (newForm, formInList) {
    var diseasesInList = formInList.classification.elements[0].elements;
    var newDisease = newForm.classification.elements[0].elements[0];
    var newSubDisease = newForm.classification.elements[0].elements[0].elements[0];
    diseasesInList.forEach(function (diseaseInList) {
        if (diseaseInList.name === newDisease.name) {
            var subDiseaseInList = diseaseInList.elements;
            subDiseaseInList.forEach(function (subDiseaseInList) {
                if (subDiseaseInList.name !== newSubDisease) {
                    subDiseaseInList.push(newSubDisease);
                }
            })
        }
        else {
            diseasesInList.push(newDisease);
        }
    })
}

setTimeout(function () {
        var start = new Date().getTime();
        fs.readFile(__dirname + '/nindsForms.json', 'utf8', function (err, data) {
            if (err) throw err;
            var newForms = [];
            oldForms = JSON.parse(data);
            async.eachSeries(oldForms, function (oldForm, formCallback) {
                var newForm = new Form({
                    stewardOrg: {
                        name: globals.orgName
                    },
                    naming: [{
                        designation: oldForm.crfModuleGuideline,
                        definition: oldForm.description
                    }],
                    isCopyrighted: oldForm.copyRight == "true" ? true : false,
                    referenceDocuments: [{
                        uri: oldForm.downloads
                    }],
                    formElements: [{
                        elementType: "section",
                        label: "Main Section",
                        cardinality: "0.1",
                        formElements: []
                    }],
                    classification: [{
                        stewardOrg: {name: "NINDS"},
                        elements: [{
                            name: "Disease",
                            elements: [{
                                name: oldForm.diseaseName,
                                elements: [{
                                    name: oldForm.subDiseaseName,
                                    elements: []
                                }]
                            }]
                        }]
                    }]
                });
                var questions = newForm.formElements[0].formElements;
                async.eachSeries(oldForm.cdes, function (cde, cdeCallback) {
                    var question = {elementType: "question"};
                    question.label = cde.questionText;
                    var cdeId = cde.cdeId;
                    mongo_cde.byOtherId("NINDS", cdeId, function (err, data) {
                        question.cde = data;
                        if (!data) {
                            console.log(cdeId);
                            throw cdeId + " not found.";
                        }
                        if (data.valueDomain.datatype === 'Value List')
                            question.answers = data.valueDomain.permissibleValues;
                        questions.push(question);
                        cdeCallback();
                    });
                }, function doneAllCdes() {
                    //saveForm(form, user, formCallback);
                    newForms.push(newForm);
                    var i = oldForms.indexOf(oldForm) + 1;
                    console.log("oldForm " + i + " pushed.");
                    formCallback();
                });
            }, function doneAllForm() {
                var end = new Date().getTime();
                var time = end - start;
                var f = {
                    size: newForms.length,
                    time: 'Execution time: ' + time
                };
                newForms.push(f);
                console.log("finished all forms.");
                fs.writeFile(__dirname + "/newForms.json", JSON.stringify(newForms), "utf8", function (err) {
                    if (err) console.log(err);
                    else {
                        console.log("finish saving new forms");
                    }
                })
            })
        })
    },
    3000
)
;

/*
 var saveForm = function (form, user, formCallback) {
 mongo_form.create(form, user, function (err, newForm) {
 if (err) {
 console.log(err);
 throw err;
 }
 else {
 var i = forms.indexOf(form) + 1;
 console.log("form " + i + " saved.");
 }
 })
 }
 */


