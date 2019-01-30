const _ = require('lodash');

const mongo_form = require('../server/form/mongo-form');
const Form = mongo_form.Form;

let formCount = 0;

let cond = {$or: [{'definitions.tags': null}, {'definitions.tags': null}]};
Form.find(cond, async (err, forms) => {
    if (err) throw err;
    else {
        console.log('There are ' + forms.length + ' forms have null tags.');
        for (let form of forms) {
            let formObj = form.toObject();
            console.log('Fixing form: ' + formObj._id);
            let designations = _.forEach(formObj.designations, d => {
                let filterTags = d.tags.filter(t => t !== 'null' && t !== 'undefined' && !_.isEmpty(t));
                d.tags = filterTags;
            });
            form.designations = designations;
            let definitions = _.forEach(formObj.definitions, d => {
                let filterTags = d.tags.filter(t => t !== 'null' && t !== 'undefined' && !_.isEmpty(t));
                d.tags = filterTags;
            });
            form.definitions = definitions;
            await form.save();
            formCount++;
            console.log('formCount: ' + formCount);
        }
        console.log('Finished All Orgs.');
        process.exit(1);
    }
});