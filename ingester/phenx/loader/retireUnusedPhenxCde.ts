import { DataElement } from 'server/cde/mongo-cde';
import { Form } from 'server/form/mongo-form';
import { BATCHLOADER, updateCde } from 'ingester/shared/utility';

process.on('unhandledRejection', error => {
    console.log(error);
});

let cdeCount = 0;
let retiredPhenxCde = 0;
const retiredPhenxCdes: string[] = [];

export async function retiredUnusedPhenxCde() {
    const cond = {
        'registrationState.registrationStatus': {$ne: 'Retired'},
        archived: false,
        'stewardOrg.name': 'LOINC',
        classification: {$exists: true}, $where: 'this.classification.length<2'
    };
    const cursor = DataElement.find(cond).cursor();
    return cursor.eachAsync(async (cde: any) => {
        const cdeObj = cde.toObject();
        const linkedForm = await Form.findOne({
            archived: false,
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
        if (linkedForm) {
//            console.log(`Skipping cde ${cdeObj.tinyId}, because it presents in form ${linkedForm.tinyId}`);
        } else {
            cdeObj.registrationState.registrationStatus = 'Retired';
            cdeObj.changeNote = 'Retired because not used on any form.';
            await updateCde(cdeObj, BATCHLOADER);
            retiredPhenxCdes.push(cdeObj.tinyId);
            retiredPhenxCde++;
        }
        cdeCount++;
    });
}
