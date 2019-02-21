const _ = require('lodash');
const NindsModel = require('../ingester/createMigrationConnection').NindsModel;

const mongo_form = require('../server/form/mongo-form');
const FormSource = mongo_form.FormSource;

const CreateForm = require('../ingester/ninds/Form/CreateForm');

run = async () => {
    let formIdList = await NindsModel.distinct('formId');
    for (let formIdString of formIdList) {
        let formId = formIdString.replace('form', '').trim();
        let nindsForms = await NindsModel.find({formId: formId}).lean();
        let newFormObj = await CreateForm.createForm(nindsForms);
        newFormObj.source = 'NINDS';
        await new FormSource(newFormObj).save();
    }
};
