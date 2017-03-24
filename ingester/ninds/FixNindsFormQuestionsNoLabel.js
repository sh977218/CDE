var async = require('async');
var FormModel = require('../../modules/form/node-js/mongo-form').Form;

var totalForm = 0;
FormModel.find({
    'stewardOrg.name': 'NINDS',
    archived: false,
    'formElements': {$size: 1},
    $or: [{'formElements.formElements.label': ''}, {'formElements.formElements.label': 'N/A'}]
}).exec(function (err, allForms) {
    if (err) throw err;
    async.each(allForms, function (form, cb) {
        doForm(form, cb);
    }, function () {
        console.log('-----------------------------------------');
        console.log('total Form: ' + totalForm);
        //noinspection JSUnresolvedVariable
        process.exit(0);
    });
});

function doForm(form, cb) {
    totalForm++;
    var formElements = form.get('formElements');
    if (formElements && formElements.length === 0) {
        cb();
    } else if (formElements && formElements.length > 0) {
        var questions = formElements[0].formElements;
        questions.forEach(function (q) {
            if (q.label.length === 0) {
                q.hideLabel = true;
            }
        });
        form.markModified('formElements');
        form.save(function (err) {
            if (err) throw err;
            cb();
        });
    } else {
        console.log("something wrong with form.");
        console.log("form Id: " + form.get('tinyId'));
        process.exit(0);
    }
}