import { Form } from 'server/form/mongo-form';
import { PROTOCOL } from 'ingester/createMigrationConnection';
import { BATCHLOADER, imported, lastMigrationScript, updateForm } from 'ingester/shared/utility';

import { PhenxLogger } from 'ingester/log/PhenxLogger';
import { LoincLogger } from 'ingester/log/LoincLogger';
import { RedcapLogger } from 'ingester/log/RedcapLogger';
import { loadPhenxById } from 'ingester/phenx/loader/loadPhenxById';
import { sortBy } from 'lodash';
import { retiredUnusedPhenxCde } from 'ingester/phenx/loader/retireUnusedPhenxCde';

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
    return new Promise(resolve => {
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
                }
            }).then(resolve);
    });
}

async function retireCdes() {
    await retiredUnusedPhenxCde();
}

process.on('unhandledRejection', error => {
    console.log(error);
});

function fixProp(protocol) {
    const protocolObj = protocol.toObject();
    protocol.properties = sortBy(protocolObj.properties, 'key');
}

function fixRefDoc(protocol) {
    const protocolObj = protocol.toObject();
    protocolObj.referenceDocuments.forEach(r => {
        r.languageCode = 'en-us';
    });
    protocol.referenceDocuments = sortBy(protocolObj.referenceDocuments, ['docType', 'languageCode', 'document']);
}

async function run() {
//    const cond = {protocolID: {$in: ['190401']}};
    const cond = {};
    const phenxIds = await PROTOCOL.find(cond, {protocolID: 1}).lean();
//    const slicedPhenxIds = phenxIds.slice(0, 10);
    const slicedPhenxIds = phenxIds;
    for (const phenxId of slicedPhenxIds) {
        // @TODO remove after this load
        const existingForm: any = await Form.findOne({archived: false, 'ids.id': phenxId.protocolID});
        if (existingForm) {
            fixRefDoc(existingForm);
            fixProp(existingForm);
            await existingForm.save();
        }

        await loadPhenxById(phenxId.protocolID);
    }
    console.log('Retiring cdes.');
    await retireCdes();
    console.log('Retiring forms.');
    await retireForms();
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
