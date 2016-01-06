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

async.series([
    function (doneConnectionEstablished) {
        conn.on('error', function (err) {
            throw err;
        });
        conn.once('open', function callback() {
            console.log("connected to " + mongoUrl);
            doneConnectionEstablished();
        });
    }, function (cb) {
        Form.find({
            archived: null
        }).limit(10).exec(function (err, forms) {
            if (err) {
                console.log(err);
                process.exit(0);
            }
            async.eachSeries(forms, function (form, doneOneForm) {
                var formObj = form.toObject();
                var formElements = form.get('formElements');
                var getQuestions = function (formElements) {
                    formElements.forEach(function (fe) {
                        if (fe.elementType === 'question') {
                            var cdeTinyId = fe.question.cde.tinyId;
                            var version = fe.question.cde.version;
                            DataElement.findOne({tinyId: cdeTinyId, version: version}).exec(function (err, cde) {
                                if (err) {
                                    console.log(err);
                                    process.exit(0);
                                }
                                console.log('finished cde id: ' + cdeTinyId + ' version: ' + version);
                                fe.question.cdeName = (cde.get('naming'))[0].designation;
                            });
                        }
                        else {
                            getQuestions(fe.formElements);
                        }
                    });
                };
                getQuestions(formElements);
                form.markModified('formElements');
                form.save(function (err) {
                    if (err)
                        process.exit(1);
                    else {
                        console.log('finished form id: ' + form.get('tinyId'));
                        doneOneForm();
                    }
                })
            }, function doneAllForms() {
                cb();
            });
        });
    }, function () {
        process.exit(0);
    }
]);

