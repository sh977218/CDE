var async = require('async');
var mongo_cde = require('../../modules/cde/node-js/mongo-cde');
var mongo_data = require('../../modules/system/node-js/mongo-data');
var MigrationFormModel = require('./../createMigrationConnection').MigrationFormModel;
var MigrationOrgModel = require('./../createMigrationConnection').MigrationOrgModel;
var MigrationLoincModel = require('./../createMigrationConnection').MigrationLoincModel;
var classificationShared = require('../../modules/system/shared/classificationShared');


const source = "LOINC";
const stewardOrgName = 'NLM';

var orgName = 'NLM';
var formCounter = 0;
var newBornScreeningOrg = null;
var today = new Date().toJSON();

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

function loadFormElements(loinc, formElements, form, cb) {
    var loadCde = function (element, fe, next) {
        mongo_cde.byOtherIdAndNotRetired('LOINC', element['LOINC#'], function (err, existingCde) {
            if (err) throw err;
            if (!existingCde) {
                console.log('cannot find this cde with loincId: ' + element['LOINC#']);
                console.log('formId: ' + form.ids[0].id);
                process.exit(1);
            } else {
                var question = {
                    instructions: {value: ''},
                    cde: {
                        tinyId: existingCde.tinyId,
                        name: existingCde.naming[0].designation,
                        version: existingCde.version,
                        permissibleValues: existingCde.valueDomain.permissibleValues,
                        ids: existingCde.ids
                    },
                    required: REQUIRED_MAP[element['ANSWER CARDINALITY']],
                    multiselect: MULTISELECT_MAP[element['ANSWER CARDINALITY']],
                    datatype: existingCde.valueDomain.datatype,
                    datatypeNumber: existingCde.valueDomain.datatypeNumber,
                    datatypeText: existingCde.valueDomain.datatypeText,
                    answers: existingCde.valueDomain.permissibleValues,
                    uoms: []
                };
                if (element['Ex UCUM Units']) {
                    question.uoms.push(element['Ex UCUM Units']);
                }

                existingCde.naming.forEach(function (n) {
                    if (n.context.contextName === "Source: Regenstrief LOINC") {
                        question.instructions.value = n.context.contextName;
                    }
                });
                var formElement = {
                    elementType: 'question',
                    label: existingCde.naming[0].designation,
                    question: question,
                    formElements: []
                };
                fe.push(formElement);
                next();
            }
        });
    };
    var loopFormElements = function (loincElements, fe, next) {
        if (loincElements && loincElements.length > 0) {
            async.forEachSeries(loincElements, function (loincElement, doneOneElement) {
                if (loincElement.elements.length > 0) {
                    MigrationFormModel.find({'ids.id': loincElement['LOINC#']}).exec(function (err, existingForms) {
                        if (err) throw err;
                        if (existingForms.length === 0) {
                            console.log('Wait for inner form ' + loincElement['LOINC#'] + ' to be created.');
                            MigrationLoincModel.find({'loincId': loincElement['LOINC#']}).exec(function (e, innerFormLoincs) {
                                if (e) throw e;
                                else {
                                    var innerFormLoinc = innerFormLoincs[0];
                                    if (innerFormLoinc.toObject) innerFormLoinc = innerFormLoinc.toObject();
                                    var innerForm = createForm(innerFormLoinc);
                                    loadFormElements(innerFormLoinc['PANEL HIERARCHY']['PANEL HIERARCHY'].elements, innerForm.formElements[0].formElements, form, function () {
                                        var obj = new MigrationFormModel(innerForm);
                                        obj.save(function (e, innerFormObj) {
                                            if (e) throw e;
                                            else {
                                                formCounter++;
                                                console.log('formCounter: ' + formCounter);
                                                var innerFe = {
                                                    elementType: 'form',
                                                    instructions: {value: ''},
                                                    cardinality: CARDINALITY_MAP[loincElement.Cardinality],
                                                    label: loincElement['LOINC Name'],
                                                    formElements: [],
                                                    inForm: {
                                                        form: {
                                                            tinyId: innerFormObj.tinyId,
                                                            version: '2.56',
                                                            name: loincElement['LOINC Name']
                                                        }
                                                    }
                                                };
                                                if (innerFormLoinc['TERM DEFINITION/DESCRIPTION(S)']) {
                                                    innerFe.instructions.value = innerFormLoinc['TERM DEFINITION/DESCRIPTION(S)']['TERM DEFINITION/DESCRIPTION(S)'][0].Description;
                                                }
                                                fe.push(innerFe);
                                                doneOneElement();
                                            }
                                        })
                                    });
                                }
                            });
                        } else if (existingForms.length === 1) {
                            var existingForm = existingForms[0];
                            fe.push({
                                elementType: 'form',
                                instructions: {value: ''},
                                cardinality: CARDINALITY_MAP[loincElement.Cardinality],
                                label: loincElement['LOINC Name'],
                                formElements: [],
                                inForm: {
                                    form: {
                                        tinyId: existingForm.tinyId,
                                        version: existingForm.version,
                                        name: existingForm.naming[0].designation
                                    }
                                }
                            });
                            doneOneElement();
                        } else {
                            console.log('More than 1 existing form found. loinc id: ' + loincElement['LOINC#']);
                            process.exit(1);
                        }
                    });
                } else {
                    loadCde(loincElement, fe, function () {
                        doneOneElement();
                    });
                }
            }, function doneAllElements() {
                next();
            });
        } else {
            loadCde(loincElements, fe, function () {
                next();
            });
        }
    };

    loopFormElements(loinc, formElements, cb);
}

function createForm(loinc) {
    var naming = parseNaming(loinc);
    var versionStr = loinc['VERSION']['VERSION'].replace('Generated from LOINC version', '').trim();
    var version = versionStr.substring(0, versionStr.length - 1);
    var ids = [{source: 'LOINC', id: loinc.loincId, version: version}];
    var properties = parseProperties(loinc);
    var referenceDocuments = parseReferenceDoc(loinc);
    var tinyId = mongo_data.generateTinyId();
    var newForm = {
        tinyId: tinyId,
        version: version,
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
        classification: [{stewardOrg: {name: stewardOrgName}, elements: []}],
        formElements: [{
            elementType: 'section',
            instructions: {value: ''},
            cardinality: CARDINALITY_MAP[loinc['PANEL HIERARCHY']['PANEL HIERARCHY'].Cardinality],
            label: loinc['PANEL HIERARCHY']['PANEL HIERARCHY']['LOINC Name'],
            formElements: []
        }]
    };
    if (loinc['TERM DEFINITION/DESCRIPTION(S)']) {
        newForm.formElements[0].instructions.value = loinc['TERM DEFINITION/DESCRIPTION(S)']['TERM DEFINITION/DESCRIPTION(S)'][0].Description;
    }
    var classType = loinc['BASIC ATTRIBUTES']['BASIC ATTRIBUTES']['Class/Type'];
    var classificationType = CLASSIFICATION_TYPE_MAP[classType];
    var classificationToAdd = ['Newborn Screening', 'Classification', classificationType];
    classificationShared.classifyItem(newForm, stewardOrgName, classificationToAdd);
    classificationShared.addCategory({elements: newBornScreeningOrg.classifications}, classificationToAdd);
    return newForm;
}
function run() {
    async.series([
        function (cb) {
            MigrationFormModel.remove({}, function (err) {
                if (err) throw err;
                console.log('Removed migration form');
                cb();
            });
        },
        function (cb) {
            MigrationOrgModel.remove({}, function (er) {
                if (er) throw er;
                console.log('Removed migration org');
                cb();
            });
        },
        function (cb) {
            new MigrationOrgModel({name: orgName}).save(function (e, org) {
                if (e) throw e;
                console.log('Created migration org of ' + orgName);
                newBornScreeningOrg = org;
                cb();
            });
        },
        function (cb) {
            MigrationOrgModel.find({name: orgName}).exec(function (e, orgs) {
                if (e) throw e;
                console.log('Found migration org of ' + orgName);
                newBornScreeningOrg = orgs[0];
                cb();
            });
        },
        function (cb) {
            MigrationLoincModel.find({}).exec(function (err, loincs) {
                if (err) throw err;
                async.forEachSeries(loincs, function (loinc, doneOneLoinc) {
                    if (loinc.toObject) loinc = loinc.toObject();
                    MigrationFormModel.find({'ids.id': loinc['loincId']}).exec(function (e, existingForms) {
                        if (e) throw e;
                        if (existingForms.length === 0) {
                            var form = createForm(loinc);
                            loadFormElements(loinc['PANEL HIERARCHY']['PANEL HIERARCHY'].elements, form.formElements[0].formElements, form, function () {
                                var obj = new MigrationFormModel(form);
                                obj.save(function (e) {
                                    if (e) throw e;
                                    else {
                                        formCounter++;
                                        console.log('formCounter: ' + formCounter);
                                        doneOneLoinc()
                                    }
                                })
                            });
                        } else {
                            doneOneLoinc()
                        }
                    })
                }, function doneAllLoincs() {
                    newBornScreeningOrg.markModified('classifications');
                    newBornScreeningOrg.save(function (e) {
                        if (e) throw e;
                        if (cb) cb();
                        console.log('Finished Load');
                    });
                })
            });
        },
        function () {
            process.exit(0);
        }]);
}

run();
