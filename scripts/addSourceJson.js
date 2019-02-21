const _ = require('lodash');
const NindsModel = require('../ingester/createMigrationConnection').NindsModel;

const mongo_form = require('../server/form/mongo-form');
const Form = mongo_form.Form;
const mongo_cde = require('../server/cde/mongo-cde');
const DataElement = mongo_cde.DataElement;

const CreateForm = require('../ingester/ninds/Form/CreateForm');


run = async () => {
    let formIdList = await NindsModel.distinct('formId');
    for (let formIdString of formIdList) {
        let formId = formIdString.replace('form', '').trim();
        let nindsForms = await NindsModel.find({formId: formIdString}).lean();
        let newFormObj = await CreateForm.createForm(nindsForms);
    }
};
