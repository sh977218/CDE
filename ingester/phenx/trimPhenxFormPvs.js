var async = require('async');
var mongo_form = require('../../modules/form/node-js/mongo-form');
var FormModel = mongo_form.Form;

var formCount = 0;

function loopFormElements(form) {
    form.formElements.forEach((fe)=> {
        if (fe.elementType === 'question') {
            if (fe.question.datatype === 'Value List') {
                fe.question.answers.forEach((a)=> {
                    a.permissibleValue = a.permissibleValue.trim();
                });
                fe.question.cde.permissibleValues.forEach((p)=> {
                    p.permissibleValue = p.permissibleValue.trim();
                })
            }
        } else {
            loopFormElements(fe);
        }
    })
};
var cond = {'classification.stewardOrg.name': 'PhenX', archived: null};
FormModel.find(cond).exec((err, forms)=> {
    async.forEach(forms, (form, doneOneForm)=> {
        loopFormElements(form);
        form.save(()=> {
            formCount++;
            console.log('formCount: ' + formCount);
            doneOneForm();
        })
    }, ()=> {
        console.log('finished all');
        process.exit(1);
    })
});