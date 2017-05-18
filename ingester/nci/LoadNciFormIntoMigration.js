var async = require('async'),
    mongo_cde = require('../../modules/cde/node-js/mongo-cde'),
    mongo_data = require('../../modules/system/node-js/mongo-data'),
    MigrationNCIModel = require('./../createMigrationConnection').MigrationNCIFormXmlModel,
    MigrationFormModel = require('./../createMigrationConnection').MigrationFormModel,
    MigrationOrgModel = require('./../createMigrationConnection').MigrationOrgModel,
    classificationShared = require('../../modules/system/shared/classificationShared'),
    classificationMapping = require('./caDSRClassificationMapping.json')
;

var orgName = 'NCI';
var source = 'caDSR';
var statusMap = {
    'RELEASE': 'RELEASE'
};
var datatypeMap = {
    CHARACTER: "Text",
    NUMBER: "Number",
    ALPHANUMERIC: "Text",
    TIME: "Time",
    DATE: "Date",
    DATETIME: "Date/Time"
};

var formCounter = 0;
var nciOrg = null;
var today = new Date().toJSON();

function compareFn(a, b) {
    /** @namespace a.displayOrder */
    return a.displayOrder[0].localeCompare(b.displayOrder[0])
}

function validateNciForm(o) {
    if (o.context.length > 1) {
        console.log('form has more than 1 context. url: ' + o.href);
        process.exit(1);
    }
    if (o.longName.length > 1) {
        console.log('form has more than 1 longName. url: ' + o.href);
        process.exit(1);
    }
    if (o.preferredDefinition.length > 1) {
        console.log('form has more than 1 preferredDefinition. url: ' + o.href);
        process.exit(1);
    }
    /** @namespace o.cadsrRAI */
    if (o.cadsrRAI.length > 1) {
        console.log('form has more than 1 cadsrRAI. url: ' + o.href);
        process.exit(1);

    }
    if (o.publicID.length > 1) {
        console.log('form has more than 1 publicID. url: ' + o.href);
        process.exit(1);
    }
    if (o.version.length > 1) {
        console.log('form has more than 1 version. url: ' + o.href);
        process.exit(1);
    }
    if (o.workflowStatusName.length > 1) {
        console.log('form has more than 1 id. workflowStatusName: ' + o.href);
        process.exit(1);

    }
    if (o.type.length > 1) {
        console.log('form has more than 1 id. type: ' + o.href);
        process.exit(1);
    }
}

function createForm(nciForm, cb) {
    /** @namespace nciForm.preferredDefinition */
    var naming = [{
        designation: nciForm.longName[0],
        definition: nciForm.preferredDefinition[0],
        languageCode: "EN-US",
        context: {
            contextName: "Health",
            acceptability: "preferred"
        }
    }];
    var ids = [{source: source, id: nciForm.publicID[0], version: nciForm.version[0]}];
    var property = {
        key: 'protocol',
        value: '<table class="table table-striped"><tr><th>preferredDefinition</th><th>shortName</th><th>context</th><th>longName</th></tr>',
        source: 'NCIP',
        valueFormat: 'html'
    };
    nciForm.protocol.forEach(function (p) {
        /** @namespace p.shortName */
        var tr = '<tr>' +
            '<td>' + p.preferredDefinition + '</td>' +
            '<td>' + p.shortName + '</td>' +
            '<td>' + p.context + '</td>' +
            '<td>' + p.longName + '</td>' +
            '</tr>';
        property.value = property.value + tr;
    });
    property.value = property.value + '</table>';

    var formElements = [];
    nciForm.module.sort(compareFn);
    async.forEach(nciForm.module, function (module, doneOneModule) {
        var sectionFE = {
            elementType: 'section',
            instructions: {value: module.instruction[0].text},
            label: module.longName[0],
            formElements: []
        };
        module.question.sort(compareFn);
        async.forEach(module.question, function (questionXml, doneOneQuestion) {
            if (questionXml.publicID.length > 1 || questionXml.version.length > 1) {
                console.log('form ' + nciForm.href + ' has more question more than 1 id or version');
                process.exit(1);
            }
            if (questionXml.dataElement.length > 1) {
                console.log('form ' + nciForm.href + ' has more than 1 dataElement');
                process.exit(1);
            }
            var de = questionXml.dataElement[0];
            var version = de.version[0].replace('.0', '');
            var id = de.publicID[0];
            mongo_cde.bySourceIdVersionAndNotRetiredNotArchived(source, id, version, function (err, existingCdes) {
                if (err) {
                    throw err;
                    process.exit(1);
                }
                var questionFE = {
                    elementType: 'question',
                    label: questionXml.questionText[0],
                    question: {
                        required: Boolean(questionXml.isMandatory[0]),
                        editable: Boolean(questionXml.isEditable[0]),
                        multiselect: Boolean(questionXml.multiValue[0]),
                        answers: []
                    },
                    formElements: []
                };
                if (existingCdes.length === 0) {
                    questionFE.question.cde = {
                        ids: [{id: id, version: version}]
                    };
                    if (de.valueDomain[0].type && de.valueDomain[0].type[0] === 'Enumerated') {
                        questionFE.question.datatype = 'Value List';
                    }
                    else {
                        questionFE.question.datatype = datatypeMap[de.valueDomain[0].datatypeName[0]];
                    }
                    if (questionFE.question.datatype === 'Number') {
                        questionFE.question.datatypeNumber = {
                            minValue: de.valueDomain[0].minimumLengthNumber[0],
                            maxValue: de.valueDomain[0].maximumLengthNumber[0],
                            precision: de.valueDomain[0].decimalPlace[0]
                        };

                    } else if (questionFE.question.datatype === 'Text') {
                        questionFE.question.datatypeText = {
                            minLength: de.valueDomain[0].minimumLengthNumber[0],
                            maxLength: de.valueDomain[0].maximumLengthNumber[0],
                            regex: '',
                            rule: ''
                        }
                    } else if (questionFE.question.datatype === 'Value List') {
                        questionXml.validValue.sort(compareFn);
                        questionXml.validValue.forEach(function (v) {
                            var pv = {
                                permissibleValue: v.value[0],
                                valueMeaningName: v.meaningText ? v.meaningText[0] : '',
                                valueMeaningCode: '',
                                valueMeaningDefinition: v.description[0],
                                codeSystemName: '',
                                codeSystemVersion: ''
                            };
                            questionFE.question.answers.push(pv);
                        });
                    }
                    sectionFE.formElements.push(questionFE);
                    doneOneQuestion();
                } else if (existingCdes.length === 1) {
                    var existingCde = existingCdes[0].toObject();
                    questionFE.question.cde = {
                        tinyId: existingCde.tinyId,
                        name: existingCde.naming[0].designation,
                        version: existingCde.version,
                        permissibleValues: existingCde.valueDomain.permissibleValues,
                        ids: existingCde.ids
                    };
                    questionFE.question.datatype = existingCde.valueDomain.datatype;
                    questionFE.question.datatypeNumber = existingCde.valueDomain.datatypeNumber;
                    questionFE.question.datatypeText = existingCde.valueDomain.datatypeText;
                    questionFE.question.uom = existingCde.valueDomain.uom;
                    if (questionFE.question.datatype === 'Value List') {
                        questionXml.validValue.sort(compareFn);
                        questionXml.validValue.forEach(function (v) {
                            var pv = {
                                permissibleValue: v.value[0],
                                valueMeaningName: v.meaningText ? v.meaningText[0] : '',
                                valueMeaningCode: '',
                                valueMeaningDefinition: v.description[0],
                                codeSystemName: '',
                                codeSystemVersion: ''
                            };
                            questionFE.question.answers.push(pv);
                        });
                    }
                    sectionFE.formElements.push(questionFE);
                    doneOneQuestion();
                } else {
                    console.log('multiple cdes found: source: ' + source + ' id: ' + id + ' version:' + version);
                    process.exit(1);
                }
            });
        }, function doneAllQuestions() {
            formElements.push(sectionFE);
            doneOneModule();
        })
    }, function doneAllModules() {
        var newForm = {
            tinyId: mongo_data.generateTinyId(),
            stewardOrg: {name: "NCI"},
            createdBy: {username: 'batchLoader'},
            created: today,
            imported: today,
            registrationState: {
                registrationStatus: "Qualified",
                administrativeStatus: statusMap[nciForm.workflowStatusName[0]]
            },
            source: source,
            naming: naming,
            ids: ids,
            properties: [property],
            changeNote: nciForm.changeNote ? (nciForm.changeNote[0] ? nciForm.changeNote[0] : '') : '',
            version: nciForm.version[0].replace('.0', ''),
            formElements: formElements,
            classification: [{
                stewardOrg: {name: 'NCI'},
                elements: [{
                    name: 'NCIP',
                    elements: []
                }]
            }]
        };

        if (nciForm.CLASSIFICATIONSLIST && nciForm.CLASSIFICATIONSLIST[0].CLASSIFICATIONSLIST_ITEM) {
            nciForm.CLASSIFICATIONSLIST[0].CLASSIFICATIONSLIST_ITEM.forEach(function (csi) {
                var getStringVersion = function (shortVersion) {
                    if (shortVersion.indexOf(".") === -1) return shortVersion + ".0";
                    else return shortVersion;
                };
                var classificationVersion = getStringVersion(csi.ClassificationScheme[0].Version[0]);
                try {
                    var classificationName = classificationMapping[csi.ClassificationScheme[0].PublicId[0] + "v" + classificationVersion].longName || "";

                } catch (e) {
                    console.log(csi.ClassificationScheme[0].PublicId[0] + "v" + classificationVersion);
                    throw e;
                }
                var classificationStatus = classificationMapping[csi.ClassificationScheme[0].PublicId[0] + "v" + classificationVersion].workflowStatusName;
                classificationShared.classifyItem(newForm, "NCI", [csi.ClassificationScheme[0].ContextName[0], classificationName, csi.ClassificationSchemeItemName[0]]);
                classificationShared.addCategory({elements: nciOrg.classifications}, [csi.ClassificationScheme[0].ContextName[0], classificationName, csi.ClassificationSchemeItemName[0]]);
            });
        }
        else {
            newForm.classification = [];
            classificationShared.classifyItem(newForm, "NCI", ['NCIP']);
            classificationShared.addCategory({elements: nciOrg.classifications}, ['NCIP']);
        }
        cb(newForm);
    })
}
function run() {
    async.series([
        function (cb) {
            MigrationFormModel.remove({}, function (err) {
                if (err) throw err;
                MigrationOrgModel.remove({}, function (er) {
                    if (er) throw er;
                    console.log('removed migration org');
                    new MigrationOrgModel({name: orgName}).save(function (e, org) {
                        if (e) throw e;
                        console.log('create new migration org');
                        nciOrg = org;
                        cb();
                    });
                });
            });
        },
        function (cb) {
            var stream = MigrationNCIModel.find({}).stream();
            stream.on('data', function (nci) {
                stream.pause();
                var nciObj;
                if (nci.toObject) nciObj = nci.toObject().form;
                validateNciForm(nciObj);
                MigrationFormModel.find({'ids.id': nciObj.publicID[0]}, function (err, existingForms) {
                    if (err) throw err;
                    if (existingForms.length === 0) {
                        createForm(nciObj, function (newForm) {
                            var newFormObj = new MigrationFormModel(newForm);
                            newFormObj.save(function (e) {
                                if (e) throw e;
                                console.log('formCounter: ' + formCounter++);
                                stream.resume();
                            })
                        });
                    } else {
                        console.log('duplicated form found: ' + nciObj.publicID[0]);
                        process.exit(1);
                    }
                });
            });
            stream.on('end', function (err) {
                if (err) throw err;
                nciOrg.markModified('classifications');
                nciOrg.save(function (e) {
                    if (e) throw e;
                    if (cb) cb();

                    process.exit(0);
                });
            });
        }]);
}

run();