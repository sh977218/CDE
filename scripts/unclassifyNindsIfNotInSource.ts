import { DataElement, DataElementSource } from '../server/cde/mongo-cde';
import { Form, FormSource } from '../server/form/mongo-form';

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
        if (!id) throw ('de ' + cdeObject.tinyId + ' does not have ninds id.');
        DataElementSource.findOne({'ids.id': id}, (err, source) => {
            if (err) throw err;
            else if (source) resolve();
            else {
                console.log('de ' + id + ' not found in source');
                if (cdeObject.classification.length < 2) {
                    console.log(cdeObject.tinyId + ' not in source, only has 1 classification.');
//                    process.exit(1);
                }
                cde.classification = cdeObject.classification.filter(c => c.stewardOrg.name !== 'NINDS');
                cde.save(e => {
                    if (e) throw err;
                    else {
                        deCount++;
                        if (deCount % 500 === 0) console.log('deCount: ' + deCount);
                        resolve();
                    }
                })
            }
        })
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
        if (!id) throw ('form ' + formObject.tinyId + ' does not have ninds id.');
        FormSource.findOne({'ids.id': id}, (err, source) => {
            if (err) throw err;
            else if (source) resolve();
            else {
                console.log('form ' + id + ' not found in source');
                if (formObject.classification.length < 2) {
                    console.log(formObject.tinyId + ' not in source, only has 1 classification.');
//                    process.exit(1);
                }
                form.classification = formObject.classification.filter(c => c.stewardOrg.name !== 'NINDS');
                form.save(e => {
                    if (e) throw e;
                    else {
                        formCount++;
                        if (formCount % 500 === 0) console.log('formCount: ' + formCount);
                        resolve();
                    }
                })
            }
        })
    });
});
