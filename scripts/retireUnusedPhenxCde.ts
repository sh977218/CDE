import { DataElement } from 'server/cde/mongo-cde';
import { Form } from 'server/form/mongo-form';
import { BATCHLOADER, updateCde } from 'ingester/shared/utility';

process.on('unhandledRejection', error => {
    console.log(error);
});

let cdeCount = 0;
let retiredPhenxCde = 0;
const retiredPhenxCdes = [];

function run() {
    const cond = {
        'registrationState.registrationStatus': {$ne: 'Retired'},
        archived: false,
        'ids.source': 'PhenX Variable',
        classification: {$size: 1},
        'classification.stewardOrg.name': 'PhenX'
    };
    const cursor = DataElement.find(cond).cursor();
    cursor.eachAsync(async (cde: any) => {
        const cdeObj = cde.toObject();
        const linkedForm = await Form.findOne({
            $or: [{
                'formElements.question.cde.tinyId': cdeObj.tinyId
            }, {
                'formElements.formElements.question.cde.tinyId': cdeObj.tinyId
            }]
        });
        if (linkedForm) {
//            console.log(`Skipping cde ${cdeObj.tinyId}, because it presents in form ${linkedForm.tinyId}`);
        } else {
            cdeObj.registrationState.registrationStatus = 'Retired';
            cdeObj.changeNote = 'Retired because not used on any form.';
            await updateCde(cdeObj, BATCHLOADER);
            console.log(`Retired cde ${cdeObj.tinyId}, because it doesn't present in any forms.`);
            retiredPhenxCdes.push(cdeObj.tinyId);
            retiredPhenxCde++;
        }
        cdeCount++;
    }).then(() => {
        console.log('finished.');
        console.log(`cdeCount: ${cdeCount}`);
        console.log(`retiredPhenxCde: ${retiredPhenxCde}`);
        console.log('retiredPhenxCdes: ' + retiredPhenxCdes);
        process.exit(0);
    }, (e: any) => {
        console.log(e);
        process.exit(1);
    });
}

run();
