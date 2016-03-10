var fs = require('fs'),
    async = require('async'),
    mongo_form = require('../../modules/form/node-js/mongo-form')
    ;

var globals = {orgName: "NINDS"};
var formCounter = 0;
fs.readFile(process.argv[2], 'utf8', function (err, data) {
    if (err) throw err;
    if (data) {
        var array = JSON.parse(data);
        async.forEachSeries(array, function (form, doneOneForm) {
            formCounter++;
            if (form.cdes.length === 0) {
                var newForm = {
                    stewardOrg: {
                        name: globals.orgName
                    },
                    naming: [{
                        designation: form.crfModuleGuideline,
                        definition: form.description
                    }],
                    isCopyrighted: form.copyRight === "true",
                    referenceDocuments: [{
                        title: form.downloadsTitle,
                        uri: form.downloads
                    }],
                    registrationState: {
                        registrationStatus: "Qualified"
                    },
                    formElements: form.cdes.length === 0 ? [] : [{
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
                                name: form.diseaseName,
                                elements: form.diseaseName === "Traumatic Brain Injury" ? [{
                                    name: form.subDiseaseName,
                                    elements: [{
                                        name: "Domain",
                                        elements: [{
                                            name: form.domainName,
                                            elements: [{name: form.subDomainName, elements: []}]
                                        }]
                                    }]
                                }] : [{
                                    name: "Domain", elements: [{
                                        name: form.domainName,
                                        elements: [{
                                            name: form.subDomainName,
                                            elements: []
                                        }]
                                    }]
                                }]
                            }]
                        }, {
                            name: "Domain",
                            elements: [{
                                name: form.domainName,
                                elements: [{
                                    name: form.subDomainName,
                                    elements: []
                                }]
                            }]
                        }]
                    }]
                };
            }
            else {
                mongo_form.query({archived: null,}, function (err, f) {

                });
            }
            console.log('x');
            doneOneForm();
        }, function doneAllForms() {
            console.log('finished all form' + formCounter);
            process.exit(0);
        });
    }
});