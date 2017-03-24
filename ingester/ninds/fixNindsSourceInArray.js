var async = require('async'),
    mongo_form = require('../../modules/form/node-js/mongo-form'),
    Form = mongo_form.Form
    ;

var formCount = 0;

Form.find({
    archived: false,
    'stewardOrg.name': 'NINDS',
    "registrationState.registrationStatus": {$not: /Retired/}
}).exec(function (e, forms) {
    if (e) throw e;
    else {
        async.forEach(forms, function (form, doneOneForm) {
            form.sources = [{sourceName: 'NINDS'}];
            form.naming.forEach(function (n) {
                n.source = 'NINDS';
            });
            form.properties.forEach(function (p) {
                p.source = 'NINDS';
            });
            form.referenceDocuments.forEach(function (r) {
                r.source = 'NINDS';
            });
            form.save(function (err) {
                if (err) throw err;
                else {
                    formCount++;
                    console.log('formCount: ' + formCount);
                    doneOneForm();
                }
            })
        }, function doneAllForms() {
            process.exit(1);
        })
    }
});
