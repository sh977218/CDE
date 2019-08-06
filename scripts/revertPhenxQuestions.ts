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
        let histories = formObj.history.reverse().map(h => h.toString());
        for (let i = 0; i < histories.length; i++) {
            let history = histories[i];
            let historyObj = await Form.findById(history).lean();
            console.log(historyObj);
            console.log(history);
            console.log(i);
            if (!historyObj.updatedBy) {
                console.log('b');
            }
            let updatedBy = historyObj.updatedBy.username;
            if (updatedBy === 'lizamos' || updatedBy === 'ludetc') {
                formObj.formElements = historyObj.formElements;
                break;
            } else if (updatedBy !== BATCHLOADER_USERNAME) {
                formNeedReview.push(formObj.tinyId + ' updated by ' + updatedBy);
            }
        }
        await updateForm(formObj, batchloader);
        formCount++;
        console.log(`formCount: ${formCount}`);
    }).then(() => {
        console.log('finished.');
        process.exit(0);
    }, e => {
        console.log(e);
        process.exit(1);
    });
}

run();