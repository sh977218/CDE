import { Form } from 'server/form/mongo-form';
import { PROTOCOL } from 'ingester/createMigrationConnection';
import {
    BATCHLOADER, fixFormCopyright, imported, lastMigrationScript, mergeClassificationByOrg, sortProp, sortRefDoc,
    updateCde, updateForm
} from 'ingester/shared/utility';

import { PhenxLogger } from 'ingester/log/PhenxLogger';
import { LoincLogger } from 'ingester/log/LoincLogger';
import { RedcapLogger } from 'ingester/log/RedcapLogger';
import { loadPhenxById } from 'ingester/phenx/loader/loadPhenxById';
import { DataElement } from 'server/cde/mongo-cde';

/*
const NewPhenxIdToOldPhenxId = {
    10903: 10902, // Current Marital Status
    11402: 011402, // Household Roster - Relationships
    11502: 11502, // Health Insurance Coverage
    10902: 91102, // Pulse Oximetry (Rest)
    10902: 91404, // Respiratory Rate - Infant
    10902: 100303, // Current Contraception Use - Female
    10902: 100402, // Difficulty Getting Pregnant - Current Duration
    10902: 100502, // Removal of Female Reproductive Organs
    10902: 101202, // Prostate Symptoms
    10902: 122101, // Global Psychopathology Rating Scale - Research
    10902: 180302, // Quality of Life Enjoyment and Satisfaction - Adult
    10902: 211302, // Neighborhood Concentrated Disadvantage
};
*/

function retireForms() {
    let retiredForm = 0;
    return new Promise(resolve => {
        console.log('Retiring forms......');
        const cond = {
            'ids.source': {$in: ['PhenX', 'PhenX Variable']},
            'registrationState.registrationStatus': {$ne: 'Retired'},
            archived: false
        };
        Form.find(cond).cursor({batchSize: 10})
            .eachAsync(async form => {
                const formObj = form.toObject();
                if (formObj.lastMigrationScript !== lastMigrationScript) {
                    formObj.registrationState.registrationStatus = 'Retired';
                    formObj.registrationState.administrativeNote = 'Not present in import at ' + imported;
                    await updateForm(formObj, BATCHLOADER);
                    PhenxLogger.retiredPhenxForm++;
                    PhenxLogger.retiredPhenxForms.push(formObj.tinyId);
                    retiredForm++;
                    console.log(`retiredForm: ${retiredForm} ${formObj.tinyId}`);
                }
            }).then(() => {
            console.log(retiredForm + ' Forms Retired.');
            resolve();
        });
    });
}

async function retireCdes() {
    let retiredCde = 0;
    return new Promise(resolve => {
        console.log('Retiring cdes......');
        const cond = {
            'registrationState.registrationStatus': {$ne: 'Retired'},
            archived: false,
            'ids.source': {$in: ['LOINC', 'PhenX', 'PhenX Variable']},
            $where: 'this.classification.length<2'
        };
        const cursor = DataElement.find(cond).cursor({batchSize: 10});
        cursor.eachAsync(async (cde: any) => {
            const cdeObj = cde.toObject();
            const linkedForms = await Form.find({
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
                    cde.classification = cdeObj.classification.filter(c => c.stewardOrg.name !== 'PhenX');
                } else {
                    const fakeElt = {classification: []};
                    phenxForms.forEach(phenxForm => {
                        mergeClassificationByOrg(fakeElt, phenxForm, 'PhenX');
                    });
                    cde.classification = fakeElt.classification;
                }
                await cde.save();
            } else {
                cdeObj.registrationState.registrationStatus = 'Retired';
                cdeObj.changeNote = 'Retired because not used on any form.';
                await updateCde(cdeObj, BATCHLOADER);
                PhenxLogger.retiredPhenxCdes.push(cdeObj.tinyId);
                PhenxLogger.retiredPhenxCde++;
                retiredCde++;
                console.log(`Retired Cde: ${retiredCde} ${cdeObj.tinyId}`);
            }
        }).then(() => {
            console.log(retiredCde + ' cdes retired.');
            resolve();
        });
    });
}

process.on('unhandledRejection', error => {
    console.log(error);
});

async function run() {
//    const cond = {protocolID: {$in: ['211501']}};
    const cond = {};
    const phenxIds = await PROTOCOL.find(cond, {protocolID: 1}).lean();
//    const slicedPhenxIds = phenxIds.slice(0, 10);
    const slicedPhenxIds = phenxIds;
    for (const phenxId of slicedPhenxIds) {
        // @TODO remove after this load
        const existingForm: any = await Form.findOne({archived: false, 'ids.id': phenxId.protocolID});
        if (existingForm) {
            fixFormCopyright(existingForm);
            existingForm.referenceDocuments = sortRefDoc(existingForm);
            existingForm.properties = sortProp(existingForm.toObject());
            await existingForm.save();
        }

        await loadPhenxById(phenxId.protocolID);
    }
    await retireForms();
    await retireCdes();
    PhenxLogger.log();
    LoincLogger.log();
    RedcapLogger.log();
}

run().then(() => {
        console.log('Finished PhenX Loader: ');
        process.exit(0);
    }, err => {
        console.log('err: ' + err);
        process.exit(1);
    }
);
