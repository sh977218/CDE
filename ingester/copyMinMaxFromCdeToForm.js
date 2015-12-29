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
        DataElement.find({
            $or: [
                {'valueDomain.datatypeNumber.minValue': {$exists: true}},
                {'valueDomain.datatypeNumber.maxValue': {$exists: true}}
            ],
            "archived": null
        }).limit(10).exec(function (err, cdes) {
            async.eachSeries(cdes, function (cde, doneOneCde) {
                var cdeObj = cde.toObject();
                var min = cdeObj.valueDomain.datatypeNumber.minValue;
                var max = cdeObj.valueDomain.datatypeNumber.maxValue;
                var tinyId = cdeObj.tinyId;
                Form.find({
                    'formElements.formElements.question.cde.tinyId': tinyId,
                    "archived": null
                }).limit(10).exec(function (err, forms) {
                    async.eachSeries(forms, function (form, doneOneForm) {
                        var formObj = form.toObject();
                        doneOneForm();
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


