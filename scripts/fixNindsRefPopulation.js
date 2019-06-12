const mongo_cde = require('../server/cde/mongo-cde');
const DataElement = mongo_cde.DataElement;
const DataElementSource = mongo_cde.DataElementSource;

const mongo_form = require('../server/form/mongo-form');
const Form = mongo_form.Form;
const FormSource = mongo_form.FormSource;

const classificationShared = require('esm')(module)('../shared/system/classificationShared');

let deCount = 0;
let formCount = 0;

/*
 not archived
 not Preclinical
 not retired
 but in NINDS
*/
let cond = {
    'archived': false,
    'registrationState.registrationStatus': {$ne: 'Retired'},
    'classification.stewardOrg.name': 'NINDS',
    'classification.elements.name': {$ne: 'Preclinical TBI'}
};

let deCursor = DataElement.find(cond).cursor();

deCursor.eachAsync(function (cde) {
    return new Promise(function (resolve) {
        let cdeObject = cde.toObject();
        let id = '';
        cdeObject.ids.forEach(i => {
            if (i.source === 'NINDS') id = i.id;
        });
        if (!id) {
            console.log('de ' + cdeObject.tinyId + ' does not have ninds id.');
            process.exit(1);
        } else {
            DataElementSource.findOne({'ids.id': id}, (err, source) => {
                if (err) {
                    console.log(err);
                    process.exit(1);
                } else if (!source) {
                    console.log('de ' + id + ' not found in source');
                    resolve();
                } else {
                    let sourceObject = source.toObject();
                    cde.referenceDocuments = sourceObject.referenceDocuments;
                    sourceObject.classification.forEach(c => {
                        c.elements.forEach(e => {
                            if (e.name === 'Population') {
                                e.elements.forEach(p => {
                                    let populationToAdd = ['Population'];
                                    populationToAdd.push(p.name);
                                    classificationShared.classifyElt(cde, "NINDS", populationToAdd);
                                })
                            }
                        })
                    });

                    cde.classification = cde.classification.filter(c => c.elements && c.elements.length > 0);
                    cde.save(e => {
                        if (e) {
                            console.log(e);
                            process.exit(1);
                        } else {
                            deCount++;
                            if (deCount % 500 === 0) console.log('deCount: ' + deCount);
                            resolve();
                        }
                    })
                }
            })
        }
    });
});


let formCursor = Form.find(cond).cursor();

formCursor.eachAsync(function (form) {
    return new Promise(function (resolve) {
        let formObject = form.toObject();
        let id = '';
        formObject.ids.forEach(i => {
            if (i.source === 'NINDS') id = i.id;
        });
        if (!id) {
            console.log('form ' + formObject.tinyId + ' does not have ninds id.');
            process.exit(1);
        } else {
            FormSource.findOne({'ids.id': id}, (err, source) => {
                if (err) {
                    console.log(err);
                    process.exit(1);
                } else if (!source) {
                    console.log('form ' + id + ' not found in source');
                    resolve();
                } else {
                    let sourceObject = source.toObject();
                    form.referenceDocuments = sourceObject.referenceDocuments;
                    sourceObject.classification.forEach(c => {
                        c.elements.forEach(e => {
                            if (e.name === 'Population') {
                                e.elements.forEach(p => {
                                    let populationToAdd = ['Population'];
                                    populationToAdd.push(p.name);
                                    classificationShared.classifyElt(form, "NINDS", populationToAdd);
                                })
                            }
                        })
                    });

                    form.classification = form.classification.filter(c => c.elements && c.elements.length > 0);
                    form.save(e => {
                        if (e) {
                            console.log(e);
                            process.exit(1);
                        } else {
                            formCount++;
                            if (formCount % 500 === 0) console.log('formCount: ' + formCount);
                            resolve();
                        }
                    })
                }
            })
        }
    });
});


