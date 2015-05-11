var fs = require('fs')
    , util = require('util')
    , xml2js = require('xml2js')
    , mongoose = require('mongoose')
    , shortid = require('shortid')
    , classNode = require('../modules/system/node-js/classificationNode.js')
    , config = require('config')
    , cde_schemas = require('../modules/cde/node-js/schemas')
    , sys_schemas = require('../modules/system/node-js/schemas')
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
    console.log('mongodb connection open');
});    

var DataElement = conn.model('DataElement', cde_schemas.dataElementSchema);
var MigrationDataElement = migrationConn.model('DataElement', cde_schemas.dataElementSchema);

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
var todo = 0;

var checkTodo = function() {
    todo--;
    if (todo === 0) {
        console.log("nothing left to do");
        process.exit(0);
    }
};

setInterval(function(){console.log("TODO: " + todo)}, 10000);


var stream = MigrationDataElement.find().stream();
stream.on('data', function (migrationCde) {
    todo++;
    var orgName = migrationCde.stewardOrg.name;
    var cdeId = 0;
    for (var i = 0; i < migrationCde.ids.length; i++) {
        if (migrationCde.ids[i].source === orgName)
            cdeId = migrationCde.ids[i].id;
    }
    
    if (cdeId !== 0) {
        DataElement.find({archived: null, "registrationState.registrationStatus": {$not: /Retired/}})
            .where("ids").elemMatch(function(elem) {
                elem.where("source").equals(orgName);
                elem.where("id").equals(cdeId);
        }).exec(function(err, existingCdes) {
            if (existingCdes.length === 0) {
                var newDe = new DataElement(migrationCde);
                newDe.save(function(err) {
                    if (err) console.log("unable to save");
                    else {
                        console.log(created++ + " CDE Created -- " + newDe.naming[0].designation + " -- TODO: " + todo);
                        migrationCde.remove(function(err) {
                            if (err) console.log("unable to remove");
                            else checkTodo();
                        });
                    }
                });
            } else if (existingCdes.length > 1) {
                console.log("Too many CDEs with Id = " + cdeId + " -- TODO: " + todo);
                checkTodo();
            } else {
                var existingCde = existingCdes[0];
                var jsonDe = JSON.parse(JSON.stringify(existingCde));
                delete jsonDe._id;                
                var newDe = new DataElement(jsonDe);
                newDe.history.push(existingCde._id);
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
                existingCde.archived = true;
                existingCde.save(function(err) {
                    if (err) {
                        console.log("Can't archive existing: " + err);
                    } else {
                        newDe.save(function(err) {
                            if (err) {
                                console.log("Can't save new Cde " + err);
                            } else {
                                //console.log(changed++ + " CDE modified -- " + newDe.naming[0].designation);
                                migrationCde.remove(function(err) {
                                    if (err) console.log("unable to remove");
                                    else checkTodo();


                                });
                            }
                        });
                    }
                });
            }
        });        
    } else {
        // No Cde.
        console.log("CDE with no ID. !! ");
        checkTodo();
    }
        
});

stream.on('error', function (err) {
    console.log("!!!!!!!!!!!!!!!!!! Unable to read from Stream !!!!!!!!!!!!!!");
});

stream.on('close', function () {
    console.log("End of stream");
    console.log("TODO: " + todo);
});
