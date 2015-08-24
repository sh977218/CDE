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

var cdeNotFound = [];

setTimeout(function () {
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
                        label: "",
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
                    var question =
                    {
                        "elementType": "question",
                        "label": cde.questionText,
                        "formElements": [],
                        "question": {
                            cde: {
                                tinyId: "",
                                version: ""
                                , permissibleValues: []
                            },
                            datatype: "",
                            uoms: [],
                            required: {
                                type: false
                            },
                            editable: {
                                type: true
                            },
                            multiselect: false,
                            otherPleaseSpecify: {
                                value: {
                                    type: false
                                }
                            },
                            answers: []
                        }
                    }
                    var cdeId = cde.cdeId;
                    if (cdeId.length < 5) {
                        console.log("cdeId is too short. cdeid:" + cdeId);
                    }
                    else {
                        mongo_cde.byOtherId("NINDS", cdeId, function (err, data) {
                            if (!data) {
                                cdeNotFound.push(cdeId);
                            } else {
                                question.question.cde.tinyId = data.tinyId;
                                question.question.cde.version = data.version;
                                if (data.valueDomain.datatype === 'Value List')
                                    question.question.answers = data.valueDomain.permissibleValues;
                                questions.push(question);
                            }
                            cdeCallback();
                        });
                    }
                }, function doneAllCdes() {
                    newForms.push(newForm);
                    var i = oldForms.indexOf(oldForm) + 1;
                    console.log("form " + i + " pushed.");
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
                        console.log("cannot found cde in db:" + cdeNotFound);
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


