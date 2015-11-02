var mongoose = require('mongoose'),
    config = require('../../modules/system/node-js/parseConfig'),
    schemas = require('../../modules/system/node-js/schemas.js'),
    cde_schemas = require('../../modules/cde/node-js/schemas'),
    async = require('async');

var mongoUrl = config.mongoMigrationUri;
var conn = mongoose.createConnection(mongoUrl, {auth: {authdb: "admin"}});
Org = conn.model('Org', schemas.orgSchema);
var DataElement = conn.model('DataElement', cde_schemas.dataElementSchema);

var duplicatedCdeId = [];

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
        DataElement.aggregate([
            {$match: {archived: null, "registrationState.registrationStatus": {$ne: "Retired"}}}
            , {$unwind: "$ids"}
            , {$match: {"ids.source": "NINDS"}}
            , {$group: {_id: {source: "$ids.source", id: "$ids.id"}, count: {$sum: 1}}}
            , {$match: {count: {$gte: 2}}}
        ], function (err, results) {
            if (err) throw err;
            if (results.length > 0) {
                console.log('duplicate found');
                async.eachSeries(results, function (result, doneOneResult) {
                    var cdeId = result._id.id;
                    duplicatedCdeId.push(cdeId);
                    console.log('there are ' + result.count + ' duplicate of cde id: ' + cdeId);
                    console.log('start removing duplicate of cde id: ' + cdeId);
                    DataElement.find({'ids.id': cdeId}, function (er, cdes) {
                        if (er) throw er;
                        console.log('found ' + cdes.length + ' cdes of cde id ' + cdeId);
                        cdes[0].remove(function (e) {
                                if (e) throw e;
                                console.log('deleted ' + cdes[0]._id + '\n\n');
                                doneOneResult();
                            }
                        )
                    })
                }, function doneAllResult() {
                    console.log('finished remove all duplicated cdes');
                    console.log('duplicated cde id: ' + duplicatedCdeId);
                    cb();
                })
            }
            else {
                console.log('no duplicate found');
                cb();
            }
        })


    }, function () {
        process.exit(0);
    }]);