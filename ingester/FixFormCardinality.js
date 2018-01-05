var mongoose = require('mongoose'),
    config = require('../server/system/parseConfig'),
    form_schemas = require('../server/form/schemas'),
    async = require('async');

var mongoUrl = config.mongoUri;
var conn = mongoose.createConnection(mongoUrl);
var Form = conn.model('Form', form_schemas.formSchema);
var counter = 0;

function loopFormElements(fe) {
    fe.formElements.forEach(function (e) {
        if (e.cardinality !== undefined) {
            e.cardinality = {
                "0.1": {
                    min: 0, max: 1
                },
                "*": {
                    min: 0, max: -1
                },
                "+": {
                    min: 1, max: -1
                },
                "1": {
                    min: 1, max: 1
                }
            }[e.cardinality];
        }
        loopFormElements(e);
    });
    return;
};

Form.find({}).exec(function (err, forms) {
    if (err) throw err;
    async.eachSeries(forms, function (form, doneOneForm) {
        var id = form.get('_id');
        var formObj = form.toObject();
        loopFormElements(formObj);
        Form.update({_id: id}, {$set: {formElements: formObj.formElements}}, function () {
            counter++;
            console.log('form' + counter + ' form id: ' + form.tinyId);
            doneOneForm();
        });
    }, function doneAllForms() {
        console.log('finished all forms: ' + counter);
        process.exit(0);
    });
});