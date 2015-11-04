var schemas = require('../../modules/system/node-js/schemas.js'),
    mongoose = require('mongoose'),
    config = require('../../modules/system/node-js/parseConfig'),
    classificationShared = require('../../modules/system/shared/classificationShared'),
    cde_schemas = require('../../modules/cde/node-js/schemas'),
    async = require('async');

var mongoUrl = config.mongoUri;
var conn = mongoose.createConnection(mongoUrl, {auth: {authdb: "admin"}});
var Org = conn.model('Org', schemas.orgSchema);
var DataElement = conn.model('DataElement', cde_schemas.dataElementSchema);

async.series([
    function (doneConnectionEstablished) {
        conn.on('error', function (err) {
            throw err;
        });
        conn.once('open', function callback() {
            console.log("connected to " + mongoUrl);
            doneConnectionEstablished();
        });
    },
    function (cb) {
        DataElement.find({'classification.stewardOrg.name': 'PhenX'}, function (err, cdes) {
            if (err) throw err;
            async.eachSeries(cdes, function (cde, doneOnePhenXCDE) {
                var oldClassifications = cde.get('classification').toObject();
                async.eachSeries(oldClassifications, function (oldClassification, doneOneClassification) {
                    if (oldClassification.stewardOrg.name === 'PhenX') {
                        oldClassification.elements[0].elements.forEach(function (element) {
                            var newClassificationPath = ['caBIG', 'PhenX', element.name];
                            classificationShared.classifyItem(cde, 'NCI', newClassificationPath);
                        });
                    }
                    doneOneClassification();
                }, function doneAllClassification() {
                    cde.markModified('classification');
                    cde.save(function (e) {
                        if (e) throw e;
                        doneOnePhenXCDE();
                    });
                });

            }, function doneAllPhenXCDEs() {
                cb();
            })
        })
    },
    function () {
        process.exit(0);
    }
]);

