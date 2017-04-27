const mongo_form = require('../modules/form/node-js/mongo-form'),
    async = require('async')
;

let count = 0;

mongo_form.Form.find({"classification.stewardOrg.name": "NCI", archived: false}, (err, pForms) => {

    async.eachSeries(pForms, (pForm, oneFormDone) => {
        pForm.formElements.forEach(section => {
           section.formElements.forEach(question => {
               question = question.question;
               if (question.answers) {

                   question.answers = question.answers.filter((a, pos) => {
                       return question.answers.findIndex(fa => fa.permissibleValue === a.permissibleValue) === pos;
                   });

                   if (question.cde.permissibleValues) {
                       question.cde.permissibleValues = question.cde.permissibleValues.filter((a, pos) => {
                           return question.cde.permissibleValues.findIndex(fa => fa.permissibleValue === a.permissibleValue) === pos;
                       });
                   }

                   question.answers.forEach(a => {
                       let pv = question.cde.permissibleValues.find(e => e.permissibleValue === a.permissibleValue);
                       if (!pv) {
                           console.log("No PV for form: " + pForm.tinyId + " and CDE: " + question.cde.tinyId +
                               " and pv: " + a.permissibleValue);
                       } else {
                           a.valueMeaningCode = pv.valueMeaningCode;
                           a.codeSystemName = undefined;
                           a.codeSystemVersion = undefined;
                       }
                   });
               }
           });
        });
        pForm.save(oneFormDone);
    }, () => {
        console.log("all done");
        process.exit(0);
    });

});
