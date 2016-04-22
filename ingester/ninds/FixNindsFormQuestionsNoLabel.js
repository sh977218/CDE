var async = require('async'),
    FormModel = require('./../createConnection').FormModel
    ;

var totalForm = 0;
var modifiedForm = 0;
var sameForm = 0;
FormModel.find({
    'stewardOrg.name': 'NINDS',
    archived: null,
    'formElements': {$size: 1},
    'formElements.formElements.label': ''
}).exec(function (err, allForms) {
    if (err) throw err;
    async.each(allForms, function (form, cb) {
        doForm(form, cb);
    }, function () {
        console.log('-----------------------------------------');
        console.log('total Form: ' + totalForm);
        console.log('modified Form: ' + modifiedForm);
        console.log('same Form: ' + sameForm);
        //noinspection JSUnresolvedVariable
        process.exit(0);
    });
});

function doForm(form, cb) {
    totalForm++;
    var formElements = form.get('formElements');
    if (formElements && formElements.length === 0) {
        sameForm++;
        cb();
    } else if (formElements && formElements.length > 0) {
        modifiedForm++;
        var questions = formElements[0].formElements;
        questions.forEach(function (q) {
            if (q.label.length === 0) {
                q.hideLabel = true;
            }
        });
        form.save(function (err) {
            if (err) throw err;
            console.log(totalForm);
            cb();
        });
    } else {
        console.log("something wrong with form.");
        console.log("form Id: " + form.get('tinyId'));
        process.exit(0);
    }
}