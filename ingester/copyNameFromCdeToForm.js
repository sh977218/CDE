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

var formCounter = 0;

Form.find({
    tinyId: "-1EuCaaUS",
    archived: null
}).exec(function (err, forms) {
    if (err) {
        console.log(err);
        process.exit(0);
    }
    async.eachSeries(forms, function (form, doneOneForm) {
        console.log("begin form id: " + form.tinyId);
        var questionCount = 0;
        var areYouDone = function () {
            console.log(questionCount);
            if (questionCount === 0) {
                form.save(function (err) {
                    if (err)
                        process.exit(1);
                    else {
                        console.log('saved form id: ' + form.tinyId);
                        formCounter++;
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
                    if (fe._Id)
                        delete fe._id;
                    var cdeTinyId = fe.question.cde.tinyId;
                    var version = fe.question.cde.version;
                    DataElement.findOne({tinyId: cdeTinyId, version: version}).exec(function (err, cde) {
                        questionCount--;
                        if (err) {
                            console.log(err);
                            process.exit(0);
                        }
                        console.log('found cde id: ' + cdeTinyId + ' version: ' + version);
                        if (cde) fe.question.cde.name = cde.naming[0].designation;
                        else {
                            if (cdeTinyId === 'zZoPTQYOGoX') {
                                console.log('stop');
                            }
                            console.log("no CDE with id: " + cdeTinyId)
                        }
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
        console.log('finished all forms, # form: ' + formCounter);
        process.exit(0);
    });
});

