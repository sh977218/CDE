var mongoose = require('mongoose'),
    config = require('../modules/system/node-js/parseConfig'),
    cde_schemas = require('../modules/cde/node-js/schemas'),
    mongo_cde = require('../modules/cde/node-js/mongo-cde'),
    async = require('async');

var mongoUrl = config.mongoUri;
var conn = mongoose.createConnection(mongoUrl);
var DataElement = conn.model('DataElement', cde_schemas.dataElementSchema);

var counter = 0;
var user = {username: "peter"};
var duplicatedCdeId = [];
var orgName = "NINDS";
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
            {$match: {archived: false, "registrationState.registrationStatus": {$ne: "Retired"}}}
            , {$unwind: "$ids"}
            , {$match: {"ids.source": orgName}}
            , {$group: {_id: {source: "$ids.source", id: "$ids.id"}, count: {$sum: 1}}}
            , {$match: {count: {$gte: 2}}}
        ], function (err, results) {
            if (err) throw err;
            if (results.length > 0) {
                console.log('duplicate found');
                async.eachSeries(results, function (result, doneOneResult) {
                    counter++;
                    var cdeId = result._id.id;
                    duplicatedCdeId.push(cdeId);
                    console.log('there are ' + result.count + ' records for cde id: ' + cdeId);
                    console.log(counter + ': start removing duplicate of cde id: ' + cdeId);
                    DataElement.find({"archived": false}).elemMatch("ids", {
                        "source": 'NINDS',
                        "id": cdeId
                    }).exec(function (err, cdes) {
                        if (err) throw err;
                        console.log('found ' + cdes.length + ' cdes of cde id ' + cdeId);
                        var cde = cdes[0];
                        cde.registrationState.registrationStatus = "Retired";
                        cde.registrationState.administrativeNote = "This CDE is replaced by https://cde.nlm.nih.gov/deview?tinyId=" + cdes[1].tinyId;
                        cde.updatedBy.username = "batchloader";
                        mongo_cde.update(cde, user, function (err) {
                            if (err) throw err;
                            console.log('deleted ' + cdes[0]._id + '\n');
                            doneOneResult();
                        });
                    });
                }, function doneAllResult() {
                    console.log('finished remove all duplicated cdes');
                    console.log('duplicated cde id: ' + duplicatedCdeId);
                    cb();
                });
            }
            else {
                console.log('no duplicate found');
                cb();
            }
        });
    }, function () {
        //noinspection JSUnresolvedVariable
        process.exit(0);
    }]);