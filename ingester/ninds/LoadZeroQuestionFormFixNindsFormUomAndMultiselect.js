var fs = require('fs'),
    async = require('async'),
    mongoose = require('mongoose'),
    config = require('../../modules/system/node-js/parseConfig'),
    mongo_form = require('../../modules/form/node-js/mongo-form')
    ;
var mongoMigrationUri = config.mongoMigrationUri;
var migrationConn = mongoose.createConnection(mongoMigrationUri);
migrationConn.once('open', function callback() {
    console.log('mongodb ' + config.database.migration.db + ' connection open');
});

var NindsModel = migrationConn.model('NINDS', new mongoose.Schema({}, {
    strict: false,
    collection: 'ninds'
}));
var globals = {orgName: 'NINDS'};
var user = {username: 'batchloader'};
var formCounter = 0;
var stream = NindsModel.find().stream();

function createForm(form) {
    var newForm = {
        stewardOrg: {
            name: globals.orgName
        },
        naming: [{
            designation: form.crfModuleGuideline,
            definition: form.description
        }],
        isCopyrighted: form.copyRight === 'true',
        referenceDocuments: [{
            title: form.downloadsTitle,
            uri: form.downloads
        }],
        registrationState: {
            registrationStatus: 'Qualified'
        },
        formElements: form.cdes.length === 0 ? [] : [{
            elementType: 'section',
            label: '',
            cardinality: '0.1',
            formElements: []
        }],
        classification: [{
            stewardOrg: {name: 'NINDS'},
            elements: [{
                name: 'Disease',
                elements: [{
                    name: form.diseaseName,
                    elements: form.diseaseName === 'Traumatic Brain Injury' ? [{
                        name: form.subDiseaseName,
                        elements: [{
                            name: 'Domain',
                            elements: [{
                                name: form.domainName,
                                elements: [{name: form.subDomainName, elements: []}]
                            }]
                        }]
                    }] : [{
                        name: 'Domain', elements: [{
                            name: form.domainName,
                            elements: [{
                                name: form.subDomainName,
                                elements: []
                            }]
                        }]
                    }]
                }]
            }, {
                name: 'Domain',
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
    return newForm;
}

function findCdeInCes(cdes, label) {
    for (var i = 0; i < cdes.length; i++) {
        if (cde.cdeName === label) {
            return cde;
        }
    }
    return null;
};

stream.on('data', function (data) {
    stream.pause();
    if (data) {
        var form = data.toObject();
        formCounter++;
        if (form.cdes.length === 0) {
            var newForm = createForm(form);
            mongo_form.create(newForm, user, function (err, newF) {
                if (err) throw err;
                stream.resume();
            });
        } else {
            var query = {'naming.designation': form.crfModuleGuideline, 'referenceDocuments.uri': form.downloads};
            mongo_form.query(query, function (err, existingForms) {
                if (err) throw err;
                if (existingForms.length === 0) {
                    console.log('no form found, query: ' + query);
                }
                else if (existingForms.length === 1) {
                    var existingForm = existingForms[0];
                    var fes = existingForm.get('formElements');

                }
                else {
                    console.log('found ' + existingForms.length + ' forms, query: ' + query);
                }
                stream.resume();
            })
        }
    }
    else {
        stream.resume();
    }
});
stream.on('end', function () {
    console.log('finished all form' + formCounter);
    process.exit(0);
});