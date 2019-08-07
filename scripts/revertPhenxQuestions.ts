import { Form } from 'server/form/mongo-form';
import { batchloader, BATCHLOADER_USERNAME, updateForm } from 'ingester/shared/utility';

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
        let histories = formObj.history.map(h => h.toString());
        for (let i = 0; i < histories.length; i++) {
            let history = histories[i];
            let historyObj = await Form.findById(history).lean();
            console.log(historyObj);
            console.log(history);
            console.log(i);
            let updatedBy = historyObj.updatedBy;
            if (!updatedBy) {
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
        await updateForm(formObj, batchloader);
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