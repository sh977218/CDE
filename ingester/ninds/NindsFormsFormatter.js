var timeStart = new Date().getTime();

var fs = require('fs'),
    mongoose = require('mongoose'),
    config = require('config'),
    mongo_cde = require('../../modules/cde/node-js/mongo-cde'),
    mongo_form = require('../../modules/form/node-js/mongo-form')
    async = require('async')
    ;

config.mongoUri = config.mongoMigrationUri;

// Global variables
var globals = {
    orgName: "NINDS"
};

var numForms = 0;
var cdeNotFound = {};

var processFile = function() {
    fs.readFile(__dirname + '/input/UnformattedNindsForms.json', 'utf8', function (err, data) {
        var oldForms = JSON.parse(data);
        if (err) throw err;
        // @TODO fix with params
        async.eachSeries(oldForms, function (oldForm, formCallback) {
            numForms++;
            var newForm = {
                stewardOrg: {
                    name: globals.orgName
                },
                naming: [{
                    designation: oldForm.crfModuleGuideline,
                    definition: oldForm.description
                }],
                isCopyrighted: oldForm.copyRight === "true",
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
            };
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
                            };
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
                    };
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
                    mongo_form.create(newForm, {username: "batchloader"}, function(err) {
                        if (err) throw err;
                        console.log("form " + numForms + " pushed.");
                        formCallback();
                    });
                });
            } else {
                mongo_form.create(newForm, {username: "batchloader"}, function(err) {
                    if (err) throw err;
                    console.log("form " + numForms + " pushed.");
                    formCallback();
                });
            }
        }, function doneAllForm() {
            var timeEnd = new Date().getTime();
            var timeTake = timeEnd - timeStart;
            console.log("finished all forms.");
            process.exit(0);
        });
    });
};

// @TODO replace with params.
var conn = mongoose.createConnection("mongodb://siteRootAdmin:password@localhost:27017/test", {auth: {authdb: "admin"}});
conn.on('error', function(err) {
    throw err;
});
conn.once('open', function callback() {
    setTimeout(processFile(), 3000);
});


