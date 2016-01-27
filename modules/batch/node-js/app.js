var cde_schemas = require('../../cde/node-js/schemas')
    , sys_schemas = require('../../system/node-js/schemas')
    , connHelper = require('../../system/node-js/connections')
    , config = require('../../system/node-js/parseConfig')
    , mongoose = require('mongoose')
    , multer  = require('multer')
    , async = require('async')
    , updateCdes = require('./updateCdes')
    ;

var migrationConn = connHelper.establishConnection(config.database.migration);

var MigrationDataElement = migrationConn.model('DataElement', cde_schemas.dataElementSchema);
var MigrationOrg = migrationConn.model('Org', sys_schemas.orgSchema);

var batchSchema = new mongoose.Schema({
        batchProcess: {type: String, enum: ['caDSR']},
        step: {type: String
            , enum: ['initiated', 'orgLoaded', 'migrationCdesLoaded', 'loadInProgress', 'batchComplete']
            , default: "initiated"},
        startTime: {type: Date, default: Date.now}
    }
);

var Batch = migrationConn.model('Batch', batchSchema);

exports.init = function(app) {

    app.post('/abortBatch', function(req, res) {
        MigrationDataElement.remove({}, function(err) {
            if (err) return res.status(500).send(err);
            Batch.remove({}, function(err) {
                if (err) return res.status(500).send(err);
                res.send("OK");
            });
        });
    });

    app.get('/currentBatch', function(req, res) {
        Batch.find({}, function(err, results) {
            if (err) return res.status(500).send(err);
            if (results.length > 1) {
                Batch.remove({}, function(err) {
                    if (err) return res.status(500).send(err);
                    res.send();
                })
            } else {
                res.send(results[0]);
            }
        });
    });

    app.post('/initBatch', function(req, res) {
        Batch.remove({}, function(err) {
            if (err) return res.status(500).send(err);
            MigrationOrg.remove({}, function(err) {
                if (err) return res.status(500).send(err);
                Batch({batchProcess: req.body.batchProcess}).save(function(err, newBatch) {
                    if (err) return res.status(500).send(err);
                    MigrationDataElement.remove({}, function(err) {
                        if (err) return res.status(500).send(err);
                        res.send(newBatch);
                    });
                })
            })
        });
    });

    app.get("/migrationCdeCount", function (req, res) {
        MigrationDataElement.count({}, function(err, count) {
            if (err) return res.status(500).send(err);
            return res.send("" + count);
        })
    });

    app.post("/migrationOrg", function(req, res) {
        MigrationOrg(req.body.migrationOrg).save(function(err) {
            if (err) return res.status(500).send(err);
            Batch.update({}, {step: "orgLoaded"}, {}, function(err) {
                if (err) return res.status(500).send(err);
                return res.send("OK");
            });
        });
    });

    app.post("/migrationCdes", multer({"inMemory": true}), function(req, res) {
        var cdes = JSON.parse(req.files.migrationJson.buffer.toString());
        async.each(cdes,
            function(migCde, cb){
                MigrationDataElement(migCde).save(cb);
            }
            , function(err) {
                if (err) return res.status(500).send(err);
                Batch.update({}, {step: "migrationCdesLoaded"}, {}, function(err) {
                    if (err) return res.status(500).send(err);
                    return res.send("OK");
                });
            });
    });

    app.post("/beginMigration", function(req, res) {
        Batch.update({}, {step: "loadInProgress"}, {}, function(err) {
            updateCdes.beginMigration('caDSR', MigrationDataElement, MigrationOrg, function () {
                Batch.update({}, {step: "batchComplete"}, {}, function (err) {
                    if (err) return res.status(500).send(err);
                    return res.send("OK");
                });
            });
        })
    });

};