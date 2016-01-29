var cde_schemas = require('../../cde/node-js/schemas')
    , sys_schemas = require('../../system/node-js/schemas')
    , connHelper = require('../../system/node-js/connections')
    , config = require('../../system/node-js/parseConfig')
    , mongoose = require('mongoose')
    , multer  = require('multer')
    , async = require('async')
    , fs = require('fs')
    , child_process = require('child_process')
;

var migrationConn = connHelper.establishConnection(config.database.migration);

var MigrationDataElement = migrationConn.model('DataElement', cde_schemas.dataElementSchema);
var MigrationOrg = migrationConn.model('Org', sys_schemas.orgSchema);

var batchSchema = new mongoose.Schema({
        batchProcess: {type: String, enum: ['caDSR']},
        step: {type: String
            , enum: ['initiated', 'orgLoaded', 'migrationCdesLoaded', 'loadInProgress', 'batchComplete']
            , default: "initiated"},
        startTime: {type: Date, default: Date.now},
        logs: String
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
        new MigrationOrg(req.body.org).save(function(err) {
            if (err) return res.status(500).send(err);
            Batch.update({}, {step: "orgLoaded"}, {}, function(err) {
                if (err) return res.status(500).send(err);
                return res.send("OK");
            });
        });
    });

    app.post("/migrationCdes", multer(), function(req, res) {
        spawned = child_process.spawn('mongorestore', ['--username', config.database.migration.username
            , "--password", config.database.migration.password
            , "-d", config.database.migration.db
            , "-c", "dataelements", req.files.migrationJson.path], {stdio: 'inherit'}
        );

        spawned.on('data', function(data) {
            console.log(data);
        });

        spawned.on('exit', function() {
            Batch.update({}, {step: "migrationCdesLoaded"}, {}, function() {
                console.log("Batch Object Updated.");
            });
            fs.unlink(req.files.migrationJson.path);
        });
        res.send("OK");
    });

    var spawned;

    app.post("/beginMigration", function(req, res) {
        Batch.update({}, {step: "loadInProgress"}, {}, function() {
            res.send("OK");
            var logs = "";
            spawned = child_process.spawn(config.pmNodeProcess || "node", ['ingester/updateCdes', 'caDSR'], {stdio: [0, "pipe"]});

            spawned.stdout.on("data", function(data) {
                logs = logs + "\n" + data;
            });

            intervalObj = setInterval(function() {
                Batch.update({}, {logs: logs}, {}, function(err) {
                });
            }, 1000);

            spawned.on("exit", function() {
                console.log("-- COMPLETE");
                clearTimeout(intervalObj);
                Batch.update({}, {logs: logs}, {});
            });
        })
    });

    app.post("/haltMigration", function(req, res) {
        Batch.update({}, {step: "stopped"}, {}, function(err, newBatch) {
            spawned.kill();
            res.send(newBatch);
        });
    });

};