const MigrationNindsModel = require('./../createMigrationConnection').MigrationNindsModel;
const DataElement = require('../../server/cde/mongo-cde').DataElement;
const MigrationForm = require('./../createMigrationConnection').MigrationFormModel;
const classificationShared = require('@std/esm')(module)('../../shared/system/classificationShared');
const updateShare = require('../updateShare');
const CreateForm = require('../Form/CreateForm');

const importDate = new Date().toJSON();
let count = 0;

function checkExistingNaming(existingNaming, ninds) {
    let crfModuleGuideline = ninds.get('crfModuleGuideline').trim();
    let description = ninds.get('description').trim();
    let existFormName;
    existingNaming.forEach(function (existingName) {
        if (existingName.designation.trim() === crfModuleGuideline && existingName.definition.trim() === description)
            existFormName = true;
    });
    if (!existFormName && crfModuleGuideline.length > 0) {
        let newFormName = {
            designation: crfModuleGuideline,
            definition: description,
            languageCode: "EN-US"
        };
        existingNaming.push(newFormName);
        console.log('added new form name to form id: ' + ninds.get('formId'));
        console.log('new formName: ' + crfModuleGuideline);
        console.log('ninds._id: ' + ninds.id);
    }
}

function checkExistingReferenceDocuments(existingReferenceDocuments, ninds) {
    let downloadLink = ninds.get('downloadLink').trim();
    let existReferenceDocument;
    existingReferenceDocuments.forEach(function (existingReferenceDocument) {
        if (existingReferenceDocument.uri.trim() === downloadLink)
            existReferenceDocument = true;
    });
    if (!existReferenceDocument && downloadLink && downloadLink.length > 0) {
        let newReferenceDocument = {
            uri: (downloadLink.indexOf('http://') !== -1 || downloadLink.indexOf('https://') !== -1) ? downloadLink : ''
        };
        existingReferenceDocuments.push(newReferenceDocument);
        console.log('added new reference document: ' + ninds.get('formId'));
        console.log('newCde reference: ' + downloadLink);
        console.log('ninds._id: ' + ninds.id);
    }
}

function mergeForm(ninds, existingForm) {
    let newForm = createForm(ninds);
    updateShare.mergeNaming(newForm, existingForm);
    updateShare.mergeSources(newForm, existingForm);
    updateShare.mergeIds(newForm, existingForm);
    updateShare.mergeProperties(newForm, existingForm);
    updateShare.mergeReferenceDocument(newForm, existingForm);

    existingForm.updated = importDate;
    classificationShared.transferClassifications(newForm, existingForm);
}

async function run() {
    await MigrationForm.remove({});
    console.log("Migration Form removed.");
    let cursor = MigrationNindsModel.find({}).cursor();
    cursor.eachAsync(ninds => {
        if (ninds.toObject) ninds = ninds.toObject();
        return new Promise(async (resolve, reject) => {
            let formName = ninds.get('crfModuleGuideline').toLowerCase();
            if (formName.indexOf("summary") > -1 ||
                formName.indexOf("recommendations") > -1 ||
                formName.indexOf("recommended") > -1 ||
                formName.indexOf("overview") > -1 ||
                formName.indexOf("guidelines") > -1) {
                resolve();
            } else {
                let formId = ninds.formId;
                let existingForms = await MigrationForm.find({'ids.id': formId});
                if (existingForms.length === 0) {
                    let newForm = CreateForm.createForm(ninds);
                    console.log('start cde of form: ' + formId);
                    let cdes = ninds.get('cdes');
                    if (cdes.length > 0)
                        newForm.formElements.push({
                            elementType: 'section',
                            instructions: {value: ''},
                            label: '',
                            formElements: []
                        });
                    for (let cde of cdes) {
                        let cdeId = cde.cdeId;
                        let cond = {
                            archived: false,
                            "registrationState.registrationStatus": {$ne: "Retired"},
                            'ids.id': cdeId
                        };
                        let existingCde = await DataElement.findOne(cond);
                        let question = {
                            cde: {
                                tinyId: existingCde.tinyId,
                                name: existingCde.naming[0].designation,
                                version: existingCde.version,
                                ids: existingCde.ids
                            },
                            datatype: existingCde.valueDomain.datatype,
                            uom: existingCde.valueDomain.uom
                        };
                        if (question.datatype === 'Value List') {
                            question.cde.permissibleValues = existingCde.valueDomain.permissibleValues;
                            question.multiselect = cde.inputRestrictions === 'Multiple Pre-Defined Values Selected';

                            let permissibleValues = [];
                            let pvsArray = cde.permissibleValue.split(';');
                            let isPvValueNumber = /^\d+$/.test(pvsArray[0]);
                            let pdsArray = cde.permissibleDescription.split(';');
                            if (pvsArray.length !== pdsArray.length) {
                                console.log('*******************permissibleValue and permissibleDescription do not match.');
                                console.log('*******************ninds:\n' + ninds);
                                console.log('*******************cde:\n' + cde);
                                process.exit(1);
                            }
                            for (let i = 0; i < pvsArray.length; i++) {
                                if (pvsArray[i].length > 0) {
                                    let pv = {
                                        permissibleValue: pvsArray[i],
                                        valueMeaningDefinition: pdsArray[i]
                                    };
                                    if (isPvValueNumber) {
                                        pv.valueMeaningName = pdsArray[i];
                                    } else {
                                        pv.valueMeaningName = pvsArray[i];
                                    }
                                    permissibleValues.push(pv);
                                }
                            }
                            question.answers = permissibleValues;
                        } else if (question.datatype === 'Text') {
                            question.datatypeText = existingCde.valueDomain.datatypeText;
                        } else if (question.datatype === 'Number') {
                            question.datatypeNumber = existingCde.valueDomain.datatypeNumber;
                        } else if (question.datatype === 'Date') {
                            question.datatypeDate = existingCde.valueDomain.datatypeDate;
                        } else if (question.datatype === 'File') {
                            question.datatypeDate = existingCde.valueDomain.datatypeDate;
                        } else {
                            throw 'Unknown question.datatype: ' + question.datatype + ' cde id: ' + existingCde.ids[0].id;
                        }
                        let formElement = {
                            elementType: 'question',
                            instructions: {value: cde.instruction},
                            question: question,
                            formElements: []
                        };
                        if (cde.questionText === 'N/A' || cde.questionText.trim().length === 0) {
                            formElement.label = existingCde.naming[0].designation;
                            formElement.hideLabel = true;
                        } else {
                            formElement.label = cde.questionText;
                        }
                        newForm.formElements[0].formElements.push(formElement);
                        doneOneCDE();
                    }
                    await new MigrationForm(newForm).save();
                    count++;
                    console.log('count: ' + count);
                    resolve();
                } else if (existingForms.length === 1) {
                    let existingForm = existingForms[0];
                    mergeForm(ninds, existingForm);
                    existingForm.save();
                    resolve();
                } else {
                    console.log(existingForms.length + ' forms found, formId: ' + ninds.formId);
                    process.exit(1);
                }
            }
        })
    }).then(() => process.exit());
}

run();