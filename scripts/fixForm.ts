import { Form } from '../server/form/mongo-form';

process.on('unhandledRejection', function (error) {
    console.log(error);
});

(function () {
    let formCount = 0;
    Form.find({
        archived: false,
        'ids.source': 'PhenX'
    }).cursor().eachAsync(async (form: any) => {
        await form.save().catch(e => {
            throw `${form.tinyId} ${e}`;
        });
        formCount++;
        console.log(`formCount: ${formCount}`);
    }).then(e => {
        console.log(e);
    })
})();