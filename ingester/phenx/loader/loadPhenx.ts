import { Form } from 'server/form/mongo-form';
import { PROTOCOL } from 'ingester/createMigrationConnection';
import { BATCHLOADER, imported, lastMigrationScript, updateForm } from 'ingester/shared/utility';

import { PhenxLogger } from 'ingester/log/PhenxLogger';
import { LoincLogger } from 'ingester/log/LoincLogger';
import { RedcapLogger } from 'ingester/log/RedcapLogger';
import { loadPhenxById } from 'ingester/phenx/loader/loadPhenxById';

const protocolCount = 0;

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

async function retireCdes() {/*
    return new Promise(resolve => {
        const cond = {
            'ids.source': {$in: ['PhenX', 'LOINC']},
            'registrationState.registrationStatus': {$ne: 'Retired'},
            archived: false,
            lastMigrationScript: {$ne: lastMigrationScript}
        };
        DataElement.find(cond).cursor({batchSize: 10})
            .eachAsync(async cde => {
                const cdeObj = cde.toObject();
                if (cdeObj.lastMigrationScript !== lastMigrationScript) {
                    cdeObj.registrationState.registrationStatus = 'Retired';
                    cdeObj.registrationState.administrativeNote = 'Not present in import at ' + imported;
                    await updateCde(cdeObj, BATCHLOADER);
                    PhenxLogger.retiredPhenxCde++;
                    PhenxLogger.retiredPhenxCdes.push(cdeObj.tinyId);
                }
            }).then(resolve);
    });*/
}

process.on('unhandledRejection', error => {
    console.log(error);
});

async function run() {
    //const cond = {protocolID: {$in: ['10101', '10201']}};
    const cond = {};
    const phenxIds = await PROTOCOL.find(cond, {protocolID: 1}).lean();
    for (const phenxId of phenxIds.slice(0, 10)) {
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
