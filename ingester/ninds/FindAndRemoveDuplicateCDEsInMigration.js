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


    }/*, function (cb) {
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
     }*/, function () {
        process.exit(0);
    }]);