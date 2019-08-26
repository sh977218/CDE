import { isEmpty } from 'lodash';
import { Form } from 'server/form/mongo-form';
import { BATCHLOADER, BATCHLOADER_USERNAME, updateForm } from 'ingester/shared/utility';

process.on('unhandledRejection', function (error) {
    console.log(error);
});

function run() {
    let formNeedReview = [];
    let formCount = 0;
    let cursor = Form.find({
        archived: false,
        'ids.source': 'PhenX',
        "registrationState.registrationStatus": 'Qualified',
    }).cursor();

    cursor.eachAsync(async (form: any) => {
        let formObj = form.toObject();
        console.log(formObj.tinyId);
        let histories = formObj.history.map(h => h.toString()).reverse();
        let revertEltId = '';
        let revertEltDate = '';
        let revertUsername = '';
        for (let i = 0; i < histories.length; i++) {
            let history = histories[i];
            let historyObj = await Form.findById(history).lean();
            let updatedBy = historyObj.updatedBy;
            if (isEmpty(updatedBy)) {
                console.log(`${formObj.tinyId} has history ${history} with empty updatedBy.`);
                process.exit(1);
            }
            let username = updatedBy.username;
            if (username === 'lizamos' || username === 'ludetc') {
                formObj.formElements = historyObj.formElements;
                revertEltId = history;
                revertUsername = username;
                revertEltDate = historyObj.updated;
                break;
            } else if (username !== BATCHLOADER_USERNAME) {
                formNeedReview.push(formObj.tinyId + ' updated by ' + updatedBy);
            }
            revertEltId = '';
            revertEltDate = '';
            revertUsername = '';
        }
        formObj.changeNote = `Revert to ${revertEltDate} (${revertEltId}) version updated by ${revertUsername}`;
        await updateForm(formObj, BATCHLOADER);
        formCount++;
        console.log(`formCount: ${formCount}`);
    }).then(() => {
        console.log('finished.');
        console.log('form need to be reviewed: ' + formNeedReview);
        process.exit(0);
    }, e => {
        console.log(e);
        process.exit(1);
    });
}

run();
