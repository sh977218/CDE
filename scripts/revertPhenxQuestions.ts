import { isEmpty } from 'lodash';
import { Form } from 'server/form/mongo-form';
import { BATCHLOADER, BATCHLOADER_USERNAME, TODAY, updateForm } from 'ingester/shared/utility';

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
        for (let i = 0; i < histories.length; i++) {
            let history = histories[i];
            let historyObj = await Form.findById(history).lean();
            let updatedBy = historyObj.updatedBy;
            if (isEmpty(updatedBy)) {
                console.log(history);
                console.log('b');
            }
            let username = updatedBy.username;
            if (username === 'lizamos' || username === 'ludetc') {
                formObj.formElements = historyObj.formElements;
                break;
            } else if (username !== BATCHLOADER_USERNAME) {
                formNeedReview.push(formObj.tinyId + ' updated by ' + updatedBy);
            }
        }
        formObj.changeNote = 'Revert Qualified form on ' + TODAY;
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