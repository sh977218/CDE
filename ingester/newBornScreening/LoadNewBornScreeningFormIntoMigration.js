var async = require('async');
var mongo_cde = require('../../modules/cde/node-js/mongo-cde');
var mongo_data = require('../../modules/system/node-js/mongo-data');
MigrationLoincClassMappingModel = require('./../createMigrationConnection').MigrationLoincClassificationMappingModel;
var MigrationFormModel = require('./../createMigrationConnection').MigrationFormModel;
var MigrationOrgModel = require('./../createMigrationConnection').MigrationOrgModel;
var MigrationLoincModel = require('./../createMigrationConnection').MigrationLoincModel;
var classificationShared = require('../../modules/system/shared/classificationShared');


const source = "LOINC";
const stewardOrgName = 'NLM';

var orgName = 'Newborn Screening';
var formCounter = 0;
var newBornScreeningOrg = null;
var today = new Date().toJSON();


var CLASSIFICATION_TYPE_MAP = {
    "PANEL.CHEM/Lab": "Chemistry order set",
    "PANEL.HEM/BC/Lab": "Hematology & blood count order set",
    "PANEL.H&P/Clinical": "History & Physical order set",
    "PANEL.MICRO/Lab": "Microbiology order set"
};

var statusMap = {
    'Active': 'Qualified'
};

function parseNaming(loinc) {
    var naming = [];
    var LOINCNAME = loinc['LOINC NAME']['LOINC NAME']['LOINC NAME'];
    if (LOINCNAME) {
        naming.push({
            designation: LOINCNAME,
            definition: '',
            languageCode: 'EN-US',
            context: {
                contextName: '',
                acceptability: 'preferred'
            }
        })
    }

    var NAME = loinc['NAME']['NAME'];
    if (NAME) {
        if (NAME['Long Common Name']) {
            naming.push({
                designation: NAME['Long Common Name'],
                definition: '',
                languageCode: "EN-US",
                context: {
                    contextName: "Long Common Name",
                    acceptability: 'preferred'
                }
            });
        }
        if (NAME['Shortname']) {
            naming.push({
                designation: NAME['Shortname'],
                definition: '',
                languageCode: "EN-US",
                context: {
                    contextName: "Shortname",
                    acceptability: 'preferred'
                }
            });
        }
    }
    if (loinc['TERM DEFINITION/DESCRIPTION(S)']) {
        loinc['TERM DEFINITION/DESCRIPTION(S)']['TERM DEFINITION/DESCRIPTION(S)'].forEach(function (t) {
            naming.push({
                designation: '',
                definition: t.Description,
                languageCode: "EN-US",
                context: {
                    contextName: t.Source,
                    acceptability: 'preferred'
                }
            })
        })
    }
    return naming;
}

function parseProperties(loinc) {
    var properties = [];
    if (loinc['RELATED NAMES']) {
        var table = '<table class="table table-striped">';
        var tr = '';
        loinc['RELATED NAMES']['RELATED NAMES'].forEach(function (n, i) {
            var j = i % 3;
            var td = '<td>' + n + '</td>';
            if (j === 0) {
                tr = '<tr>' + td;
            } else if (j === 1) {
                tr = tr + td;
            } else {
                tr = tr + td + '</tr>';
                table = table + tr;
            }
        });
        table = table + '</table>';
        properties.push({key: 'RELATED NAMES', value: table, source: 'LOINC', valueFormat: 'html'});
    }
    if (loinc['NAME']['NAME']['Fully-Specified Name']) {
        var ths = '';
        var tds = '';
        Object.keys(loinc['NAME']['NAME']['Fully-Specified Name']).forEach(function (key) {
            var th = '<th>' + key + '</th>';
            ths = ths + th;
            var value = loinc['NAME']['NAME']['Fully-Specified Name'][key];
            var td = '<td>' + value + '</td>';
            tds = tds + td;
        });
        var table = '<table class="table table-striped">' + '<tr>' + ths + '</tr>' + '<tr>' + tds + '</tr>' + '</table>';
        properties.push({key: 'Fully-Specified Name', value: table, source: 'LOINC', valueFormat: 'html'});
    }
    if (loinc['BASIC ATTRIBUTES']) {
        var ths = '';
        var tds = '';
        Object.keys(loinc['BASIC ATTRIBUTES']['BASIC ATTRIBUTES']).forEach(function (key) {
            var th = '<th>' + key + '</th>';
            ths = ths + th;
            var value = loinc['BASIC ATTRIBUTES']['BASIC ATTRIBUTES'][key];
            var td = '<td>' + value + '</td>';
            tds = tds + td;
        });
        var table = '<table class="table table-striped">' + '<tr>' + ths + '</tr>' + '<tr>' + tds + '</tr>' + '</table>';
        properties.push({key: 'BASIC ATTRIBUTES', value: table, source: 'LOINC', valueFormat: 'html'});
    }
    if (loinc['EXAMPLE UNITS']) {
        var trs = '<tr><th>Source Type</th><th>Unit</th></tr>';
        loinc['EXAMPLE UNITS']['EXAMPLE UNITS'].forEach(function (eu) {
            trs = trs + '<tr><td>' + eu['Source Type'] + '</td><td>' + eu['Unit'] + '</td></tr>';
        });
        var table = '<table class="table table-striped">' + trs + '</table>';
        properties.push({key: 'EXAMPLE UNITS', value: table, source: 'LOINC', valueFormat: 'html'});
    }
    if (loinc['COPYRIGHT']) {
        properties.push({
            key: 'COPYRIGHT',
            value: loinc['COPYRIGHT']['COPYRIGHT'],
            source: 'LOINC'
        })
    }
    return properties;
}

function parseReferenceDoc(loinc) {
    var referenceDocuments = [];
    if (loinc['ARTICLE']) {
        loinc['ARTICLE']['ARTICLE'].forEach(function (article) {
            referenceDocuments.push({
                uri: article.SourceLink,
                providerOrg: article.Source,
                title: article.Description,
                document: article.DescriptionLink
            });
        })
    }
    if (loinc['WEB CONTENT'] && loinc['WEB CONTENT']['WEB CONTENT']) {
        loinc['WEB CONTENT']['WEB CONTENT'].forEach(function (webContent) {
            var referenceDoc = {
                uri: webContent.SourceLink,
                providerOrg: webContent.Source,
                title: webContent.Copyright
            };
            referenceDocuments.push(referenceDoc);
        })
    }
    return referenceDocuments;
}

function parseFormElements(loinc, newCde, cb) {
    var penalHierarchy = loinc['PANEL HIERARCHY']['PANEL HIERARCHY'];
    var cardinality = {};
    if (penalHierarchy.Cardinality.length > 0) {
        if (penalHierarchy.Cardinality === '0..1') {
            cardinality.min = 0;
            cardinality.max = 1;
        }
    }
    newCde.formElements = [{
        elementType: 'section',
        instructions: {value: ''},
        label: '',
        cardinality: cardinality,
        formElements: []
    }];

    async.forEach(penalHierarchy.elements, function (element, doneOneElement) {

    }, function doneAllElements() {
        cb(newCde);
    });
    mongo_cde.byOtherIdAndNotRetired('LOINC', loincId, function (err, existingCde) {
        if (err) {
            console.log(err + ' cdeId: ' + loincId);
            throw err;
        }
        if (!existingCde) {
            console.log('cannot find this cde with loincId: ' + loincId);
            console.log('formId: ' + eyeGene.LOINC_NUM);
            process.exit(1);
        } else {
            var question = {
                cde: {
                    tinyId: existingCde.tinyId,
                    name: existingCde.naming[0].designation,
                    version: existingCde.version,
                    permissibleValues: existingCde.valueDomain.permissibleValues,
                    ids: existingCde.ids
                },
                datatype: existingCde.valueDomain.datatype,
                datatypeNumber: existingCde.valueDomain.datatypeNumber,
                datatypeText: existingCde.valueDomain.datatypeText,
                uom: existingCde.valueDomain.uom,
                answers: existingCde.valueDomain.permissibleValues
            };
            var formElement = {
                elementType: 'question',
                label: existingCde.naming[0].designation,
                question: question,
                formElements: []
            };
            newForm.formElements[0].formElements.push(formElement);
        }
    });
}

function createForm(loinc, cb) {
    var naming = parseNaming(loinc);
    var versionStr = loinc['VERSION']['VERSION'].replace('Generated from LOINC version', '').trim();
    var version = versionStr.substring(0, versionStr.length - 1);
    var ids = [{source: 'LOINC', id: loinc.loincId, version: version}];
    var properties = parseProperties(loinc);
    var referenceDocuments = parseReferenceDoc(loinc);
    var tinyId = mongo_data.generateTinyId();
    var newCde = {
        tinyId: tinyId,
        createdBy: {username: 'BatchLoader'},
        created: today,
        imported: today,
        registrationState: {registrationStatus: "Qualified"},
        source: source,
        naming: naming,
        ids: ids,
        properties: properties,
        referenceDocuments: referenceDocuments,
        stewardOrg: {name: stewardOrgName},
        classification: [{stewardOrg: {name: stewardOrgName}, elements: []}]
    };
    var classType = loinc['BASIC ATTRIBUTES']['BASIC ATTRIBUTES']['Class/Type'];
    var classificationType = CLASSIFICATION_TYPE_MAP[classType];
    var classificationToAdd = ['Newborn Screening', 'Classification', classificationType];
    classificationShared.classifyItem(newCde, stewardOrgName, classificationToAdd);
    classificationShared.addCategory({elements: newBornScreeningOrg.classifications}, classificationToAdd);
    parseFormElements(loinc, newCde, function (cde) {
        cb(cde)
    });
}
function run() {
    async.series([
        function (cb) {
            MigrationFormModel.remove({}, function (err) {
                if (err) throw err;
                MigrationOrgModel.remove({}, function (er) {
                    if (er) throw er;
                    new MigrationOrgModel({name: orgName}).save(function (e, org) {
                        if (e) throw e;
                        newBornScreeningOrg = org;
                        cb();
                    });
                });
            });
        },
        function (cb) {
            MigrationLoincModel.find({}).exec(function (err, loincs) {
                if (err) throw err;
                async.forEachSeries(loincs, function (loinc, doneOneLoinc) {
                    if (loinc.toObject) loinc = loinc.toObject();
                    createForm(loinc, function (o) {
                        MigrationFormModel.find({'ids.id': loinc.loincId}).exec(function (e, existingForms) {
                            if (e) throw e;
                            if (existingForms.length === 0) {
                                var obj = new MigrationFormModel(o);
                                obj.save(function (e) {
                                    if (e) throw e;
                                    doneOneLoinc();
                                })
                            }
                            else {
                                console.log('loinc id: ' + loinc.loincId + ' has already created');
                                doneOneLoinc();
                            }
                        })
                    });
                }, function doneAllLoincs() {
                    newBornScreeningOrg.markModified('classifications');
                    newBornScreeningOrg.save(function (e) {
                        if (e) throw e;
                        if (cb) cb();
                        //noinspection JSUnresolvedVariable
                        process.exit(0);
                    });
                })
            });
        }]);
}

run();
