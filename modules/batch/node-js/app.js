var cde_schemas = require('../../cde/node-js/schemas')
    , connHelper = require('../../system/node-js/connections')
    , config = require('../../system/node-js/parseConfig')
    , mongoose = require('mongoose')
    , multer  = require('multer')
    , async = require('async')
    ;

var migrationConn = connHelper.establishConnection(config.database.migration);

var MigrationDataElement = migrationConn.model('DataElement', cde_schemas.dataElementSchema);

var batchSchema = new mongoose.Schema({
    batchProcess: {type: String, enum: ['caDSR']},
    startTime: Date
    

    }
);

var Batch = migrationConn.model('Batch', batchSchema);

exports.init = function(app) {


    app.post('/cancelBatch', function(req, res) {
        MigrationDataElement.remove({}, function(err) {
            if (err) return res.status(500).send(err);
            Batch.remove({}, function(err) {
                if (err) return res.status(500).send(err);
                res.send("OK");
            });
        });
    });

    app.post('/initializeBatch', function(req, res) {

    });

    app.get("/migrationCdeCount", function (req, res) {
        MigrationDataElement.count({}, function(err, count) {
            if (err) return res.status(500).send(err);
            return res.send("" + count);
        })
    });

    app.post("/loadMigrationCdes", multer({"inMemory": true}), function(req, res) {
        var cdes = JSON.parse(req.files.migrationJson.buffer.toString());

        console.log(cdes);

        async.each(cdes,
            function(migCde, cb){
                MigrationDataElement(migCde).save(cb);
            }
            , function(err) {
                if (err) return res.status(500).send(err);
                return res.send("OK");
            });
    });

};