var cde_schemas = require('../../cde/node-js/schemas')
    , sys_schemas = require('../../system/node-js/schemas')
    , connHelper = require('../../system/node-js/connections')
    , config = require('../../system/node-js/parseConfig')
    , mongoose = require('mongoose')
    , multer  = require('multer')
    , async = require('async')
    , fs = require('fs')
    , spawn = require('child_process').spawn
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

    app.post("/migrationCdes",
        multer(
            //{
            //    "inMemory": true,
            //    onFileUploadData:function(file,data) {
            //        console.log("multer data");
            //    },
            //}
        ),
        function(req, res) {

            spawned = spawn('mongorestore --username ' + config.database.migration.username
                + " --password " + config.database.migration.password
                + " -d " + config.database.migration.db
                + " -c dataelements " + req.files.migrationJson.path, {stdio: 'inherit'}
            );

            spawned.on('data', function(data) {
                console.log(data);
            });

            spawned.on('end', function() {
               res.send("OK");
                fs.unlink(req.files.migrationJson.path);
            });
            //var lineReader = require('readline').createInterface({
            //    input: fs.createReadStream(req.files.migrationJson.path)
            //});
            //
            //lineReader.on('line', function (line) {
            //    lineReader.pause();
            //    var cde = JSON.parse(line);
            //    MigrationDataElement(cde).save(function(err) {
            //        if (err) {
            //            console.log(err);
            //            lineReader.close();
            //        } else {
            //            lineReader.resume();
            //        }
            //    });
            //});
            //
            //lineReader.on('end', function() {
            //    Batch.update({}, {step: "migrationCdesLoaded"}, {}, function(err) {
            //        fs.unlink(req.files.migrationJson.path)
            //    });
            //});

            res.send("OK");
        });

    var spawned;

    app.post("/beginMigration", function(req, res) {
        Batch.update({}, {step: "loadInProgress"}, {}, function() {
            res.send("OK");
            var logs;
            spawned = spawn(config.pmNodeProcess || "node", ['ingester/updateCdes', 'caDSR'], {stdio: 'inherit'});
            spawned.stdout.on("data", function(data) {
                logs = logs + data;
            });

            intervalObj = setInterval(function() {
                Batch.update({}, {logs: logs}, {});
            }, 1000);

            spawned.stdout.on("end", function() {
                clearTimeout(intervalObj);
                Batch.update({}, {logs: logs}, {});
            });
        })
    });

};