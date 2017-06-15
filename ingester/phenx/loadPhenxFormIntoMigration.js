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
    let classification = protocol.get('classification');
    let protocolName = classification[classification.length - 1];
    let descriptionOfProtocol = protocol.get('Description of Protocol').trim();
    if (protocolName || descriptionOfProtocol) {
        form.naming = [{
            designation: protocolName,
            definition: descriptionOfProtocol,
            languageCode: "EN-US",
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
            updated: protocolReleaseDate,
            copyright: {
                valueFormat: "html",
                value: "<a href='http://www.phenxtoolkit.org' target='_blank'>Terms of Use</a>"
            }
        }];
}

function createIds(form, protocol) {
    let formId = protocol.get('protocolId').trim();
    if (formId)
        form.ids = [{
            source: 'PhenX',
            id: formId,
            version: "21.0"
        }];
}

function createReferenceDocuments(form, protocol) {
    let generalReferences = protocol.get('General References');
    if (generalReferences.trim())
        form.referenceDocuments = [{
            document: generalReferences,
            source: 'PhenX'
        }];
}

function createProperties(form, protocol) {
    let properties = [];
    let prop1 = ['Specific Instructions', 'Protocol', 'Protocol Name From Source', 'Selection Rationale', 'Life Stage', 'Language', 'Participant', 'Personnel and Training Required', 'Equipment Needs', 'Mode of Administration', 'Derived Variables', 'Process and Review'];
    _.forEach(prop1, p => {
        let value = protocol.get(p);
        if (value) {
            properties.push({key: p, value: value.trim(), source: 'PhenX'});
        }
    });

    let prop3 = ["Keywords"];
    _.forEach(prop3, p => {
        let valueArray = protocol.get(p);
        if (!_.isEmpty(valueArray)) {
            let value = valueArray.join(",");
            properties.push({key: p.trim(), value: value, source: "PhenX"});
        }
    });

    let prop2 = ['Variables', 'Standards', 'Requirements'];
    _.forEach(prop2, p => {
        let valueArray = protocol.get(p);
        if (!_.isEmpty(valueArray)) {
            let th = '';
            _.forEach(_.keys(valueArray[0]), head => {
                th = th + '<th>' + head.trim() + '</th>';
            });
            let thead = '<tr>' + th + '</tr>';

            let tr = '';
            _.forEach(valueArray, valueObj => {
                let td = '';
                _.forOwn(valueObj, value => {
                    td = td + '<td>' + value.trim() + '</td>';
                });
                tr = tr + '<tr>' + td + '</tr>';
            });
            let tbody = '<tr>' + tr + '</tr>';
            let table = "<table class='table table-striped'>" + thead + tbody + "</table>";
            properties.push({key: p.trim(), value: table, valueFormat: "html", source: "PhenX"});
        }
    });
    form.properties = properties;
}


function createClassification(form, protocol) {
    protocol.get('classification').pop();
    let classificationArray = protocol.get('classification');
    let uniqueClassifications = _.uniq(classificationArray);
    let classification = [{stewardOrg: {name: 'PhenX'}, elements: []}];
    let elements = classification[0].elements;
    _.forEach(uniqueClassifications, c => {
        elements.push({
            name: c,
            elements: []
        });
        elements = elements[0].elements;
    });
    classificationShared.addCategory({elements: phenxOrg.classifications}, uniqueClassifications);
    form.classification = classification;
}
function createForm(protocol) {
    let form = {
        tinyId: mongo_data.generateTinyId(),
        createdBy: {username: updateShare.loaderUsername},
        created: importDate,
        imported: importDate,
        stewardOrg: {name: 'PhenX'},
        changeNote: "Load from version 21.0",
        registrationState: {registrationStatus: "Candidate"}
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
        },
        function (cb) {
            phenxOrg.save(e => {
                if (e)throw e;
                else cb();
            });
        }
    ], function () {
        console.log('Finished.');
        process.exit(0);
    });
}

run();