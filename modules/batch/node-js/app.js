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

    app.post('/initializeBatch', function(req, res) {

    });

    app.get("/migrationCdeCount", function (req, res) {
        MigrationDataElement.count({}, function(err, count) {
            if (err) return res.status(500).send(err);
            return res.send("" + count);
        })
    });

    app.post("/loadMigrationCdes", upload, function(req, res) {
        var cdes = JSON.parse(req.files.migrationJson.buffer.toString());

        async.each(cdes,
            function(migCde, cb){
                MigrationDataElement(migCde).save(function(err) {

                });
            }
            , function(err) {

            });
        cdes.forEach(function(migCde) {
        });

        res.send("OK");
    });

};