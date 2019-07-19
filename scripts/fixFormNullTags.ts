import { forEach, isEmpty } from 'lodash';
import { Form } from '../server/form/mongo-form';

let formCount = 0;
let cond = {$or: [{'definitions.tags': null}, {'definitions.tags': null}]};

Form.find(cond, async (err, forms) => {
    if (err) {
        throw err;
    }
    console.log('There are ' + forms.length + ' forms have null tags.');
    for (let form of forms) {
        let formObj = form.toObject();
        console.log('Fixing form: ' + formObj._id);
        form.designations = forEach(formObj.designations, d => {
            d.tags = d.tags.filter(t => t !== 'null' && t !== 'undefined' && !isEmpty(t));
        });
        form.definitions = forEach(formObj.definitions, d => {
            d.tags = d.tags.filter(t => t !== 'null' && t !== 'undefined' && !isEmpty(t));
        });
        await form.save();
        formCount++;
        console.log('formCount: ' + formCount);
    }
    console.log('Finished all forms.');
    process.exit(1);
});
