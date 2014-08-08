var fs = require('fs')
    , util = require('util')
    , xml2js = require('xml2js')
    , mongoose = require('mongoose')
    , uuid = require('node-uuid')
    , classNode = require('../modules/cde/node-js/classificationNode.js')
    , config = require('config')
    , cde_schemas = require('../modules/cde/node-js/schemas')
    , sys_schemas = require('../modules/system/node-js/schemas')
;

var parser = new xml2js.Parser();

var mongoUri = config.mongoUri;

var conn = mongoose.createConnection(mongoUri);
conn.on('error', console.error.bind(console, 'connection error:'));
conn.once('open', function callback () {
	console.log('mongodb connection open');
    });    

console.log("Loading file: " + process.argv[2]);

var DataElement = conn.model('DataElement', cde_schemas.dataElementSchema);
var Org = conn.model('Org', sys_schemas.orgSchema);

// Global variables
var globals = {
    orgName : "AHRQ",
    system : "Common Formats / Form",
	concept : "Form Name:"
};

// Adds classifications to 'orgs' collection.
var addClassification = function (orgName, system, concept) {
    var body = {};
    body.orgName = orgName;
    body.categories = [system, concept];
    classNode.addOrgClassification(body, function(){});
};

// TODO - Make this iterate over files. Otherwise, open connection is way too slow.
fs.readFile(process.argv[2], function(err, result) {
    var data = JSON.parse(result);
    console.log("Name: " + data["Name:"]);
    
    var newDE = new DataElement({
        uuid: uuid.v4()
        , created: Date.now()
        , source: globals.orgName
        , sourceId: data["Data Element ID:"] + "v" + data["Version:"]
        , stewardOrg: {
            name: globals.orgName
        }
        , registrationState: {
            registrationStatus: 'Qualified'
        }
        , version: data["Version:"]
        , dataElementConcept : {
            conceptualDomain : {
            }
        }
    });

    for (var pvi = 0; pvi < data.answers.length; pvi++) {
        var answer = data.answers[pvi];
        if (answer.id !== "Not Applicable") {
            newDE.valueDomain.permissibleValues.push(
                {
                    permissibleValue : answer.value
                    , valueMeaningName : answer.value
                    , valueMeaningCode : answer.code
                    , codeSystemName: answer.code_system_name
                });
        }
    }
    if (newDE.valueDomain.permissibleValues.length > 0) {
        newDE.valueDomain.datatype = "Value List";
    } else {
        newDE.valueDomain.datatype = data["Data Type:"];
    }

    newDE.naming = [];
    newDE.naming.push(
       {
        designation: data["Name:"]
        , definition: data["Definition:"]
        , languageCode: "EN-US" 
        , context: {
             contextName: 'Health'
             , acceptability: "preferred"
        }
       }     
    );

    newDE.naming.push(
       {
        designation: data["Data Element ISO Name:"]
        , definition: ""
        , languageCode: "EN-US" 
        , context: {
             contextName: 'ISO'
             , acceptability: "preferred"
        }
       }     
    );
    
    newDE.naming.push(
       {
        designation: data["Question:"]
        , definition: ""
        , languageCode: "EN-US" 
        , context: {
             contextName: 'Question'
             , acceptability: "preferred"
        }
       }     
    );

    newDE.naming.push(
       {
        designation: data["Guide For Use:"]
        , definition: ""
        , languageCode: "EN-US" 
        , context: {
             contextName: 'Guide For Use'
             , acceptability: "preferred"
        }
       }     
    );
	
    addClassification(globals.orgName, globals.system, data[globals.concept]);
      
    newDE.classification = [];    
    newDE.classification.push({
        stewardOrg : {
            name : globals.orgName
        },
        elements : [ 
            {
                name : globals.system,
                elements : [ 
                    {
                        name : data[globals.concept]
                    }
                ]
            }
        ]
    });
    
    newDE.save(function (err, newDE) {
        if (err) {
          console.log('unable to save DE: ' + util.inspect(newDE));
          console.log(err);
        } else {
            process.exit();
        }
    });

});

