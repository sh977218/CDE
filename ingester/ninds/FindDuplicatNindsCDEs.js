var mongoose = require('mongoose'),
    config = require('../../modules/system/node-js/parseConfig'),
    schemas = require('../../modules/system/node-js/schemas.js'),
    cde_schemas = require('../../modules/cde/node-js/schemas'),
    async = require('async'),
    ninds = require('../convertcsv');

var mongoUrl = config.mongoUri;
var conn = mongoose.createConnection(mongoUrl, {auth: {authdb: "admin"}});
Org = conn.model('Org', schemas.orgSchema);
var DataElement = conn.model('DataElement', cde_schemas.dataElementSchema);
var CdeAudit = conn.model('CdeAudit', cde_schemas.cdeAuditSchema);

var existingCdeId = {};
var duplicatedCdeId = {};

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
        ninds.forEach(function (cde) {
            var cdeId = cde['External ID.NINDS'];
            if (existingCdeId[cdeId]) {
                duplicatedCdeId[cdeId] = cdeId;
            } else {
                existingCdeId[cdeId] = cdeId;
            }
        });
        console.log("duplicatedCdeId:" + Object.keys(duplicatedCdeId));
        cb();
    }, function (cb) {
        async.eachSeries(Object.keys(duplicatedCdeId), function (cdeId, doneOneCdeId) {
            DataElement.find({archived: null, "ids.source": "NINDS", "ids.id": cdeId}, function (err, cdes) {
                if (err) throw err;
                else {
                    if (cdes.length == 2) {
                        var cde = cdes[0];

                        cde.registrationState.registrationStatus = "Retired";
                        cde.registrationState.administrativeNote = "This CDE is replaced by ?https://cde.nlm.nih.gov/deview?tinyId=" + cdes[1].tinyId;
                        cde.updatedBy.userId = "543592a2ca0aeea96df24299";
                        cde.updatedBy.username = "batchloader";
                        cde.markModified("registrationState");
                        var cdeAudit = new CdeAudit();
                        cdeAudit.save(function (err, a) {
                        });
                        cde.save(function (error) {
                            if (error) throw error;
                            doneOneCdeId();
                        });
                    }
                    else {
                        console.log("found " + cdes.length + " cdes with this cde id:" + cdeId);
                        doneOneCdeId();
                    }
                }
            });
        }, function doneAllCdeIds() {
            console.log('finished all');
            cb();
        })
    }, function () {
        process.exit(0);
    }]);