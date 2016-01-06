var mongoose = require('mongoose'),
    config = require('../modules/system/node-js/parseConfig'),
    schemas = require('../modules/system/node-js/schemas.js'),
    cde_schemas = require('../modules/cde/node-js/schemas'),
    form_schemas = require('../modules/form/node-js/schemas'),
    mongo_cde = require('../modules/cde/node-js/mongo-cde'),
    async = require('async');

var mongoUrl = config.mongoUri;
var conn = mongoose.createConnection(mongoUrl);
var DataElement = conn.model('DataElement', cde_schemas.dataElementSchema);
var Form = conn.model('Form', form_schemas.formSchema);

Form.find({
    archived: null
}).limit(10).exec(function (err, forms) {
    if (err) {
        console.log(err);
        process.exit(0);
    }
    async.eachSeries(forms, function (form, doneOneForm) {
        var questionCount = 0;
        var areYouDone = function() {
            console.log(questionCount);
            if (questionCount === 0) {
                form.save(function (err) {
                    if (err)
                        process.exit(1);
                    else {
                        console.log('finished form id: ' + form.get('tinyId'));
                        doneOneForm();
                    }
                });
            }
        };
        var formElements = form.formElements;
        var getQuestions = function (formElements) {
            formElements.forEach(function (fe) {
                if (fe.elementType === 'question') {
                    questionCount++;
                    var cdeTinyId = fe.question.cde.tinyId;
                    var version = fe.question.cde.version;
                    DataElement.findOne({tinyId: cdeTinyId, version: version}).exec(function (err, cde) {
                        questionCount--;
                        if (err) {
                            console.log(err);
                            process.exit(0);
                        }
                        console.log('finished cde id: ' + cdeTinyId + ' version: ' + version);
                        if (cde) fe.question.cdeName = cde.naming[0].designation;
                        else {console.log("no CDE with id: " + cdeTinyId)}
                        areYouDone();
                    });
                }
                else {
                    getQuestions(fe.formElements);
                }
            });
        };
        getQuestions(formElements);
        areYouDone();
        form.markModified('formElements');
    }, function doneAllForms() {
        process.exit(0);
    });
});

