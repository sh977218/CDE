var mongoose = require('mongoose'),
    config = require('../modules/system/node-js/parseConfig'),
    schemas = require('../modules/system/node-js/schemas.js'),
    cde_schemas = require('../modules/cde/node-js/schemas'),
    form_schemas = require('../modules/form/node-js/schemas'),
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
        DataElement.find({
            $or: [
                {'valueDomain.datatypeNumber.minValue': {$exists: true}},
                {'valueDomain.datatypeNumber.maxValue': {$exists: true}}
            ],
            "archived": false
        }).exec(function (err, cdes) {
            async.eachSeries(cdes, function (cde, doneOneCde) {
                console.log('cde id: ' + cde.get('tinyId'));
                var cdeObj = cde.toObject();
                var tinyId = cdeObj.tinyId;
                Form.find({
                    'formElements.formElements.question.cde.tinyId': tinyId,
                    "archived": false
                }).exec(function (err, forms) {
                    async.eachSeries(forms, function (form, doneOneForm) {
                        var formElements = form.get('formElements');
                        formElements[0].formElements.forEach(function (q) {
                            if (q.question.cde.tinyId === tinyId) {
                                q.question.datatypeNumber = cdeObj.valueDomain.datatypeNumber;
                            }
                        });
                        form.markModified('formElements');
                        form.save(function (err) {
                            if (err)
                                process.exit(1);
                            else {
                                console.log('form id: ' + form.get('tinyId'));
                                doneOneForm();
                            }
                        })
                    }, function doneAllForms() {
                        doneOneCde();
                    })
                });
            }, function doneAllCdes() {
                cb();
            });
        });
    }, function () {
        process.exit(0);
    }
]);

