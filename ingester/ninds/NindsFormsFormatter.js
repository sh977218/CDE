var timeStart = new Date().getTime();

var fs = require('fs'),
    mongoose = require('mongoose'),
    config = require('config'),
    mongo_cde = require('../../modules/cde/node-js/mongo-cde'),
    form_schemas = require('../../modules/form/node-js/schemas'),
    mongo_data_system = require('../../modules/system/node-js/mongo-data'),
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
var numForms = 0;
var cdeNotFound = {};

setTimeout(function () {
        fs.readFile(__dirname + '/input/UnformattedNindsForms.json', 'utf8', function (err, data) {
            if (err) throw err;
            var newForms = [];
            oldForms = JSON.parse(data);
            async.eachSeries(oldForms, function (oldForm, formCallback) {
                numForms++;
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
                        title: oldForm.downloadsTitle,
                        uri: oldForm.downloads
                    }],
                    registrationState: {
                        registrationStatus: "Qualified"
                    },
                    formElements: oldForm.cdes.length === 0 ? [] : [{
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
                                elements: oldForm.diseaseName === "Traumatic Brain Injury" ? [{
                                    name: oldForm.subDiseaseName,
                                    elements: [{
                                        name: "Domain",
                                        elements: [{
                                            name: oldForm.domainName,
                                            elements: [{name: oldForm.subDomainName, elements: []}]
                                        }]
                                    }]
                                }] : [{
                                    name: "Domain", elements: [{
                                        name: oldForm.domainName,
                                        elements: [{
                                            name: oldForm.subDomainName,
                                            elements: []
                                        }]
                                    }]
                                }]
                            }]
                        }, {
                            name: "Domain",
                            elements: [{
                                name: oldForm.domainName,
                                elements: [{
                                    name: oldForm.subDomainName,
                                    elements: []
                                }]
                            }]
                        }]
                    }]
                });
                if (oldForm.cdes.length > 0) {
                    var questions = newForm.formElements[0].formElements;
                    async.eachSeries(oldForm.cdes, function (cde, cdeCallback) {
                        var pvs = cde.permissibleValue.trim().split(';');
                        var pdv = cde.permissibleDescription.trim().split(';');
                        var answers = [];
                        for (var m = 0; m < pvs.length; m++) {
                            if (pvs[m] !== "" && pdv[m] !== "") {
                                var answer = {
                                    permissibleValue: pvs[m],
                                    valueMeaningName: pdv[m]
                                }
                                answers.push(answer);
                            }
                        }
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
                                answers: answers
                            }
                        }
                        var cdeId = cde.cdeId;
                        mongo_cde.byOtherId("NINDS", cdeId, function (err, data) {
                            if (!data) {
                                cdeNotFound[cdeId] = cdeId;
                            } else {
                                question.question.cde.tinyId = data.tinyId;
                                question.question.cde.version = data.version;
                                question.question.cde.permissibleValues = data.valueDomain.permissibleValues;
                                question.question.datatype = data.valueDomain.datatype;
                                questions.push(question);
                            }
                            cdeCallback();
                        });
                    }, function doneAllCdes() {
                        newForms.push(newForm);
                        var i = oldForms.indexOf(oldForm) + 1;
                        console.log("form " + i + " pushed.");
                        /*
                         if (numForms === 700) {
                         console.log("start saving first 700 forms...");
                         fs.writeFile(__dirname + "/FormattedNindsForms.json", JSON.stringify(newForms), "utf8", function (err) {
                         if (err) console.log(err);
                         else {
                         newForms = [];
                         console.log("finish saving first 700 forms...");
                         }
                         formCallback();
                         })
                         }
                         else if (numForms === 1400 || numForms === 2100) {
                         console.log("start saving another 700 forms...");
                         fs.appendFile(__dirname + "/FormattedNindsForms.json", JSON.stringify(newForms), "utf8", function (err) {
                         if (err) console.log(err);
                         else {
                         newForms = [];
                         console.log("finish saving another 700 forms...");
                         }
                         formCallback();
                         })
                         }
                         else {
                         formCallback();
                         }
                         */
                        formCallback();
                    });
                }
                else {
                    formCallback();
                }
            }, function doneAllForm() {
                var timeEnd = new Date().getTime();
                var timeTake = timeEnd - timeStart;
                console.log("finished all forms.");
                fs.writeFile(__dirname + "/FormattedNindsForms.json", JSON.stringify(newForms), "utf8", function (err) {
//                fs.appendFile(__dirname + "/FormattedNindsForms.json", JSON.stringify(newForms), "utf8", function (err) {
                    if (err) console.log(err);
                    else {
                        console.log("finish saving all forms");
                        console.log("size " + numForms);
                        console.log("Execution time: " + timeTake);
                        console.log("!!!!!remember to replace '][' with ',' manually after this run!!!!");
                        console.log("cannot found cde in db:\n" + Object.keys(cdeNotFound));
                    }
                })
            })
        })
    },
    3000
);




