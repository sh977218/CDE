import { formModel } from 'server/form/mongo-form';

(function () {
    let formCount = 0;
    formModel.find({
        archived: false,
        'ids.source': 'PhenX'
    }).cursor().eachAsync(async (form: any) => {
        form.ids.forEach(id => {
            if (id.source === 'PhenX') {
                let idNumber = parseInt(id.id);
                id.id = idNumber + '';
                form.markModified('ids');
            }
        });
        await form.save().catch(e => {
            throw `${form.tinyId} ${e}`;
        });
        formCount++;
        console.log(`formCount: ${formCount}`);
    }).then(e => {
        if (e) throw e;
        else {
            console.log('finished');
            process.exit(0);
        }
    })
})();