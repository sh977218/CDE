var schemas = require('../../modules/system/node-js/schemas.js'),
    mongoose = require('mongoose'),
    config = require('../../modules/system/node-js/parseConfig'),
    async = require('async');

var mongoUrl = config.mongoUri;
var conn = mongoose.createConnection(mongoUrl, {auth: {authdb: "admin"}});
Org = conn.model('Org', schemas.orgSchema);

var phenXOrg;
var nciOrg;
async.series([
    function (doneConnectionTest) {
        conn.on('error', function (err) {
            throw err;
        });
        conn.once('open', function callback() {
            console.log("connected to " + mongoUrl);
            async.parallel({
                one: function (cb1) {
                    Org.findOne({"name": "PhenX"}, function (err, pOrg) {
                        if (err) throw err;
                        phenXOrg = pOrg;
                        cb1();
                    });
                },
                two: function (cb2) {
                    Org.findOne({"name": "NCI"}, function (err, nOrg) {
                        if (err) throw err;
                        nciOrg = nOrg;
                        cb2();

                    });
                }
            }, function () {
                doneConnectionTest();
            });

        });
    },
    function (cb) {
        nciOrg.classifications.forEach(function (nciClassif) {
            if (nciClassif.name === "caBIG") {
                nciClassif.elements.push(phenXOrg.classifications[0]);
                nciOrg.markModified('classifications');
                nciOrg.save(function (err) {
                    if (err) console.log(err);
                    cb();
                })
            }
        });
    },
    function (cb) {
        process.exit(0);
    }
]);

