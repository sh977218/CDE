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
        let histories = formObj.history;
        for (let history of histories) {
            let historyObj = await Form.findById(history).lean();
            console.log(historyObj);
            if (historyObj.updatedBy.username === 'lizamos') {
                formObj.formElements = historyObj.formElements;
                break;
            } else if (historyObj.updatedBy.username !== BATCHLOADER_USERNAME) {
                formNeedReview.push(formObj.tinyId);
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