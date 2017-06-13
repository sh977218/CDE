/*
 This loader does NOT load questions in form or CDE.
 */
let async = require('async');
let _ = require('lodash');

let MigrationProtocolModel = require('../createMigrationConnection').MigrationProtocolModel;
let MigrationForm = require('../createMigrationConnection').MigrationFormModel;
let MigrationOrgModel = require('../createMigrationConnection').MigrationOrgModel;
let mongo_data = require('../../modules/system/node-js/mongo-data');

let classificationShared = require('../../modules/system/shared/classificationShared');
let updateShare = require('../updateShare');

let importDate = new Date().toJSON();
let count = 0;
let phenxOrg;

function createNaming(form, protocol) {
    let protocolNameFomSource = protocol.get('Protocol Name From Source').trim();
    let descriptionOfProtocol = protocol.get('Description of Protocol').trim();
    if (protocolNameFomSource || descriptionOfProtocol) {
        form.naming = [{
            designation: protocolNameFomSource,
            definition: descriptionOfProtocol,
            languageCode: "EN-US",
            context: {
                contextName: "Health",
                acceptability: "preferred"
            },
            tags: [],
            source: 'PhenX'
        }];
    }
}

function createSources(form, protocol) {
    let protocolReleaseDate = protocol.get('Protocol Release Date').trim();
    if (protocolReleaseDate)
        form.sources = [{
            sourceName: 'PhenX',
            updated: protocolReleaseDate
        }];
}

function createIds(form, protocol) {
    let formId = protocol.get('protocolId').trim();
    if (formId)
        form.ids = [{
            source: 'PhenX',
            id: formId
        }];
}

function createReferenceDocuments(form, protocol) {
    let generalReferences = protocol.get('General References').trim();
    if (generalReferences)
        form.referenceDocuments = [{
            title: generalReferences,
            source: 'PhenX'
        }];
}

function createProperties(form, protocol) {
    let properties = [];
    let prop = ['Specific Instructions', 'Protocol', 'Protocol Name From Source', 'Selection Rationale', 'Life Stage', 'Language', 'Participant', 'Personnel and Training Required', 'Equipment Needs', 'Mode of Administration', 'Derived Variables', 'Process and Review'];
    _.forEach(prop, p => {
        if (protocol.get(p)) {
            properties.push({key: p, value: p.trim()});
        }
    });

    let variables = protocol.get('variables');
    let standards = protocol.get('Standards');
    let requirements = protocol.get('Requirements');

}


function createClassification(form, protocol) {
    let uniqueClassifications = _.uniq(protocol.get('classification'));
    let classification = [{stewardOrg: {name: 'PhenX'}, elements: []}];
    let elements = classification[0].elements;
    _.forEach(uniqueClassifications, c => {
        elements.push({
            name: c,
            elements: []
        });
        elements = elements[0].elements;
    });
    form.classification = classification;
}
function createForm(protocol) {
    let form = {
        tinyId: mongo_data.generateTinyId(),
        createdBy: {username: updateShare.loaderUsername},
        created: importDate,
        imported: importDate,
        stewardOrg: {name: 'PhenX'},
        registrationState: {registrationStatus: "Qualified"}
    };
    createNaming(form, protocol);
    createSources(form, protocol);
    createIds(form, protocol);
    createReferenceDocuments(form, protocol);
    createProperties(form, protocol);
    createClassification(form, protocol);
    return form;
}
function run() {
    async.series([
        function (cb) {
            MigrationForm.remove({}, function (err) {
                if (err) throw err;
                console.log("Migration Form removed.");
                cb();
            });
        },
        function (cb) {
            MigrationOrgModel.findOne({name: 'PhenX'}).exec(function (err, org) {
                if (err) throw err;
                else if (org) {
                    phenxOrg = org;
                    cb();
                } else {
                    new MigrationOrgModel({name: "PhenX", classification: []}).save(function (e, o) {
                        if (o) throw o;
                        else {
                            phenxOrg = org;
                            cb();
                        }
                    });
                }
            });
        },
        function (cb) {
            let stream = MigrationProtocolModel.find({}).stream();
            stream.on('data', function (protocol) {
                stream.pause();
                let formId = protocol.get('formId');
                MigrationForm.find({}).where("ids").elemMatch(function (elem) {
                    elem.where("source").equals("PhenX");
                    elem.where("id").equals(formId);
                }).exec(function (err, existingForms) {
                    if (err) throw err;
                    else if (existingForms.length === 0) {
                        let newForm = createForm(protocol);
                        new MigrationForm(newForm).save(function (err) {
                            if (err) throw err;
                            else {
                                count++;
                                console.log('count: ' + count);
                                stream.resume();
                            }
                        });
                    } else {
                        console.log(existingForms.length + ' forms found, formId: ' + protocol.formId);
                        process.exit(1);
                    }
                });
            });
            stream.on('end', function (err) {
                if (err) throw err;
                if (cb) cb();
            });

        }], function () {
        console.log('Finished.');
        process.exit(0);
    });
}

run();