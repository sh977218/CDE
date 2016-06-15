var async = require('async'),
    mongo_cde = require('../../modules/cde/node-js/mongo-cde'),
    mongo_data = require('../../modules/system/node-js/mongo-data'),
    MigrationNCIModel = require('./../createConnection').MigrationNCIFormXmlModel,
    MigrationFormModel = require('./../createConnection').MigrationFormModel,
    MigrationOrgModel = require('./../createConnection').MigrationOrgModel,
    classificationShared = require('../../modules/system/shared/classificationShared')
    ;

var orgName = 'NCI';
var source = 'caDSR';
var map = {
    'RELEASE': 'RELEASE'
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
    var ids = [];
    nciForm.publicID.forEach(function (id, i) {
        if (i > 0) {
            console.log('there are more than 1 id in form.' + nciForm.href);
            process.exit(1);
        }
        ids.push({source: source, id: id});
    });
    var property = {
        key: 'protocol',
        value: '<table><tr><th>preferredDefinition</th><th>shortName</th><th>context</th><th>longName</th></tr>',
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
            instructions: {value: module.instruction},
            label: '',
            formElements: []
        };
        module.question.sort(compareFn);
        async.forEach(module.question, function (question, doneOneQuestion) {
            if (question.publicID.length > 1 || question.version.length > 1) {
                console.log('form ' + nciForm.href + ' has more question more than 1 id or version');
                process.exit(1);
            }
            var de = question.dataElement[0];
            var version = parseFloat(de.version[0]);
            var id = de.publicID[0];
            /** @namespace question.dataElement */
            mongo_cde.bySourceIdVersionAndNotRetiredNotArchived(source, id, version, function (err, existingCde) {
                if (err) {
                    console.log('Cannot find cde. id: ' + id);
                    console.log('Parsed version: ' + version);
                    console.log('Origin version: ' + de.version[0]);
                    console.log('form id: ' + nciForm.publicID[0]);
                    console.log('form href: ' + nciForm.href);
                    throw err;
                    process.exit(1);
                }
                /** @namespace question.multiValue */
                /** @namespace question.isMandatory */
                var questionFE = {
                    elementType: 'question',
                    label: question.questionText,
                    required: Boolean(question.isMandatory),
                    editable: Boolean(question.isEditable),
                    multiselect: Boolean(question.multiValue),
                    formElements: [],
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
                sectionFE.formElements.push(questionFE);
                doneOneQuestion();
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
                administrativeStatus: map[nciForm.workflowStatusName[0]]
            },
            source: 'NCI',
            naming: naming,
            ids: ids,
            properties: [property],
            changeNote: nciForm.changeNote ? (nciForm.changeNote[0] ? nciForm.changeNote[0] : '') : '',
            version: nciForm.version[0],
            formElements: formElements,
            classification: []
        };
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
                if (nci.toObject)  nciObj = nci.toObject().form;
                validateNciForm(nciObj);
                MigrationFormModel.find({'ids.id': nciObj.publicID[0]}, function (err, existingForms) {
                    if (err) throw err;
                    if (existingForms.length === 0) {
                        createForm(nciObj, function (newForm) {
                            newForm.formElements.push();
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
                    //noinspection JSUnresolvedVariable
                    process.exit(0);
                });
            });
        }]);
}

run();