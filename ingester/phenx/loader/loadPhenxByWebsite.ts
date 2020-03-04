import { PROTOCOL } from 'ingester/createMigrationConnection';
import { dataElementModel } from 'server/cde/mongo-cde';
import { formModel } from 'server/form/mongo-form';
import {
    BATCHLOADER, imported, lastMigrationScript, mergeClassificationByOrg, updateCde, updateForm
} from 'ingester/shared/utility';
import { loadPhenxById } from 'ingester/phenx/loader/loadPhenxById';

function retirePhenxCdes() {
    return new Promise((resolve, reject) => {
        let retiredCdeCount = 0;
        const condition = {
            archived: false,
            'ids.source': {$in: ['LOINC', 'PhenX', 'PhenX Variable']},
            'registrationState.registrationStatus': {$ne: 'Retired'},
            lastMigrationScript: {$ne: lastMigrationScript}
        };
        dataElementModel.find(condition)
            .cursor({batchSize: 10})
            .eachAsync(async cdeToRetire => {
                const cdeObj = cdeToRetire.toObject();
                const linkedForms = await formModel.find({
                    archived: false,
                    'registrationState.registrationStatus': {$ne: 'Retired'},
                    $or: [
                        {
                            'formElements.question.cde.tinyId': cdeObj.tinyId
                        },
                        {
                            'formElements.formElements.question.cde.tinyId': cdeObj.tinyId
                        },
                        {
                            'formElements.formElements.formElements.question.cde.tinyId': cdeObj.tinyId
                        },
                        {
                            'formElements.formElements.formElements.formElements.question.cde.tinyId': cdeObj.tinyId
                        },
                        {
                            'formElements.formElements.formElements.formElements.formElements.question.cde.tinyId': cdeObj.tinyId
                        },
                        {
                            'formElements.formElements.formElements.formElements.formElements.formElements.question.cde.tinyId': cdeObj.tinyId
                        },
                        {
                            'formElements.formElements.formElements.formElements.formElements.formElements.formElements.question.cde.tinyId': cdeObj.tinyId
                        },
                        {
                            'formElements.formElements.formElements.formElements.formElements.formElements.formElements.formElements.question.cde.tinyId': cdeObj.tinyId
                        },
                        {
                            'formElements.formElements.formElements.formElements.formElements.formElements.formElements.formElements.formElements.question.cde.tinyId': cdeObj.tinyId
                        }
                    ]
                });
                if (linkedForms.length > 0) {
                    const phenxForms = linkedForms.filter(linkedForm => {
                        const isPhenxClassified = linkedForm.classification.filter(c => c.stewardOrg.name === 'PhenX');
                        return isPhenxClassified.length > 0;
                    });
                    if (phenxForms.length === 0) {
                        cdeToRetire.classification = cdeObj.classification.filter(c => c.stewardOrg.name !== 'PhenX');
                    } else {
                        const fakeElt = {classification: []};
                        phenxForms.forEach(phenxForm => {
                            mergeClassificationByOrg(fakeElt, phenxForm, 'PhenX');
                        });
                        cdeToRetire.classification = fakeElt.classification;
                    }
                    await cdeToRetire.save();
                } else {
                    cdeObj.registrationState.registrationStatus = 'Retired';
                    cdeObj.changeNote = 'Retired because not used on any form.';
                    await updateCde(cdeObj, BATCHLOADER);
                    retiredCdeCount++;
                    console.log(`Retired Cde: ${retiredCdeCount} ${cdeObj.tinyId}`);
                }
            })
            .then(() => {
                console.log('retiredCdeCount: ' + retiredCdeCount);
                console.log('Finished retirePhenxCdes().');
                resolve();
            }, err => reject(err));
    });
}

function retirePhenxForms() {
    return new Promise((resolve, reject) => {
        let retiredFormCount = 0;
        const condition = {
            archived: false,
            'ids.source': {$in: ['PhenX', 'PhenX Variable']},
            'registrationState.registrationStatus': {$ne: 'Retired'},
            lastMigrationScript: {$ne: lastMigrationScript}
        };
        formModel.find(condition)
            .cursor({batchSize: 10})
            .eachAsync(async form => {
                const formObj = form.toObject();
                formObj.registrationState.registrationStatus = 'Retired';
                formObj.registrationState.administrativeNote = 'Not present in import at ' + imported;
                await updateForm(formObj, BATCHLOADER);
                retiredFormCount++;
                if (retiredFormCount % 100 === 0) {
                    console.log('retiredFormCount: ' + retiredFormCount);
                }
            })
            .then(() => {
                console.log('retiredFormCount: ' + retiredFormCount);
                console.log('Finished retirePhenxForms().');
                resolve();
            }, err => reject(err));
    });
}

async function run() {
    const cond = {protocolID: {$in: ['560201']}};
//    const cond = {};
    const phenxIds = await PROTOCOL.find(cond, {protocolID: 1}).lean();
    const slicedPhenxIds = phenxIds;
    for (const phenxId of slicedPhenxIds) {
        await loadPhenxById(phenxId.protocolID);
    }
    await retirePhenxCdes();
    await retirePhenxForms();
}

run().then(result => {
        console.log(result);
        console.log('Finished all phenx.');
        process.exit(0);
    }, err => {
        console.log(err);
        process.exit(1);
    }
);
