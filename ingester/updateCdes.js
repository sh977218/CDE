var fs = require('fs')
    , util = require('util')
    , xml2js = require('xml2js')
    , mongoose = require('mongoose')
    , shortid = require('shortid')
    , config = require('config')
    , cde_schemas = require('../modules/cde/node-js/schemas')
    , sys_schemas = require('../modules/system/node-js/schemas')
    , mongo_cde = require('../modules/cde/node-js/mongo-cde')
    , cdesvc = require('../modules/cde/node-js/cdesvc')
    , classificationShared = require('../modules/system/shared/classificationShared')
;

var parser = new xml2js.Parser();

var mongoUri = config.mongoUri;
var mongoMigrationUri = config.mongoMigrationUri;

var conn = mongoose.createConnection(mongoUri);
conn.on('error', console.error.bind(console, 'connection error:'));
conn.once('open', function callback () {
	console.log('mongodb connection open');
    });    

var migrationConn = mongoose.createConnection(mongoMigrationUri);
migrationConn.on('error', console.error.bind(console, 'connection error:'));
migrationConn.once('open', function callback () {
    console.log('mongodb migration connection open');
});    

var DataElement = conn.model('DataElement', cde_schemas.dataElementSchema);
var MigrationDataElement = migrationConn.model('DataElement', cde_schemas.dataElementSchema);

var Org = conn.model('Org', sys_schemas.orgSchema);
var MigrationOrg = migrationConn.model('Org', sys_schemas.orgSchema);

var removeProperty = function(cde, property) {
    for (var i = 0; i < cde.properties.length; i++) {
        if (property.key === cde.properties[i].key) {
            cde.properties.splice(i, 1);
            return;
        }
    }
};

var removeClassificationTree = function(cde, org) {
    for (var i = 0; i < cde.classification.length; i++) {
        if (cde.classification[i].stewardOrg.name === org) {
            cde.classification.splice(i, 1);
            return;
        }
    }
};

var changed = 0;
var created = 0;
var same = 0;
var todo = 0;
var doneThisTime = 0;

var checkTodo = function() {
    todo--;
    if (todo === 0) {
        console.log("nothing left to do");
        console.log(changed + " elements changed");
        console.log(created + " elements Created");
        console.log(same + " elements unchanged");
        doStream();
    }
};

setInterval(function(){
    console.log("TODO: " + todo +  " changed: " + changed + " same: " + same + " created: " + created);
}, 10000);

var wipeUseless = function(toWipeCde) {
    delete toWipeCde._id;
    delete toWipeCde.history;
    delete toWipeCde.imported;
    delete toWipeCde.created;
    delete toWipeCde.updated;
    delete toWipeCde.comments;
    delete toWipeCde.registrationState;
    delete toWipeCde.tinyId;
};

var compareCdes = function(existingCde, newCde) {
    existingCde = JSON.parse(JSON.stringify(existingCde));
    wipeUseless(existingCde);
    for (var i = existingCde.classification.length - 1; i > 0; i--) {
        if (existingCde.classification[i].stewardOrg.name !== newCde.source) {
            existingCde.classification.splice(i, 1);
        }
    }
    classificationShared.sortClassification(existingCde);

    newCde = JSON.parse(JSON.stringify(newCde));
    wipeUseless(newCde);

    return cdesvc.diff(existingCde, newCde);
};

var processCde = function(cdeId, migrationCde, source, orgName){
    DataElement.find({archived: null, source: source, "registrationState.registrationStatus": {$not: /Retired/}})
        .where("ids").elemMatch(function (elem) {
            elem.where("source").equals(source);
            elem.where("id").equals(cdeId);
        }).exec(function (err, existingCdes) {
            if (existingCdes.length === 0) {
                delete migrationCde._id;
                var createDe = new DataElement(migrationCde);
                createDe.save(function (err) {
                    if (err) console.log("unable to save.  " + err);
                    else {
                        created++;
                        migrationCde.remove(function (err) {
                            if (err) console.log("unable to remove: " + err);
                            else checkTodo();
                        });
                    }
                });
            } else if (existingCdes.length > 1) {
                console.log("Too many CDEs with Id = " + cdeId + " -- TODO: " + todo);
                checkTodo();
            } else {
                var existingCde = existingCdes[0];

                // deep copy
                var newDe = JSON.parse(JSON.stringify(existingCde));
                delete newDe._id;

                var deepDiff = compareCdes(existingCde, migrationCde);
                if (!deepDiff || deepDiff.length === 0) {
                    // nothing changed, remove from input
                    migrationCde.remove(function (err) {
                        same++;
                        if (err) console.log("unable to remove");
                        else checkTodo();
                    });
                } else if (deepDiff.length > 0) {
                    newDe.naming[0] = migrationCde.naming[0];
                    newDe.version = migrationCde.version;
                    newDe.changeNote = "Bulk update from source";
                    newDe.imported = new Date().toJSON();

                    for (var j = 0; j < migrationCde.properties.length; j++) {
                        removeProperty(newDe, migrationCde.properties[j]);
                        newDe.properties.push(migrationCde.properties[j]);
                    }

                    removeClassificationTree(newDe, orgName);
                    newDe.classification.push(migrationCde.classification[0]);
                    newDe._id = existingCde._id;
                    mongo_cde.update(newDe, {username: "batchloader"}, function(){
                        migrationCde.remove(function (err) {
                            if (err) console.log("unable to remove " + err);
                            else checkTodo();
                            changed++;
                        });
                    });

                } else {
                    console.log("Something wrong with deepDiff");
                    console.log(deepDiff);
                }
            }
        });
};

var streamOnData = function (migrationCde) {
    todo++;
    doneThisTime++;
    classificationShared.sortClassification(migrationCde);
    var source = migrationCde.source;
    var orgName = migrationCde.stewardOrg.name;
    var cdeId = 0;
    for (var i = 0; i < migrationCde.ids.length; i++) {
        if (migrationCde.ids[i].source === source) cdeId = migrationCde.ids[i].id;
    }

    if (cdeId !== 0) {
        processCde(cdeId, migrationCde, source, orgName);
    } else {
        // No Cde.
        console.log("CDE with no ID. !! ");
        console.log(migrationCde);
        checkTodo();
    }
};

var streamOnClose = function () {
    console.log("End of stream");
    if (doneThisTime === 0) {
        console.log("Nothing left to do, saving Org");
        MigrationOrg.find().exec(function(err, orgs) {
            if (err) console.log("Error Finding Migration Org " + err);
            orgs.forEach(function(org) {
                Org.findOne({name: org.name}).exec(function (err, theOrg) {
                    if (err)  console.log("Error finding existing org " + err);
                    theOrg.classifications = org.classifications;
                    theOrg.save(function(err) {
                        if (err) console.log("Error saving Org " + err);
                    });
                });
            });
        });

        // give 5 secs for org to save.
        setTimeout(function(){process.exit(0);}, 5000);
    }
};

var doStream = function() {
    doneThisTime = 0;
    var stream = MigrationDataElement.find().limit(200).stream();

    stream.on('data', streamOnData);

    stream.on('error', function () {
        console.log("!!!!!!!!!!!!!!!!!! Unable to read from Stream !!!!!!!!!!!!!!");
    });

    stream.on('close', streamOnClose);
};

doStream();
