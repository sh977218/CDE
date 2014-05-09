var fs = require('fs')
    , util = require('util')
    , xml2js = require('xml2js')
    , mongoose = require('mongoose')
    , uuid = require('node-uuid')
;

var parser = new xml2js.Parser();

var mongoUri = process.env.MONGO_URI || process.env.MONGOLAB_URI || 'mongodb://localhost/nlmcde';
console.log("connecting to " + mongoUri);

mongoose.connect(mongoUri);
console.log("Loading file: " + process.argv[2]);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
	console.log('mongodb connection open');
    });

var schemas = require('../node-js/schemas');

var DataElement = mongoose.model('DataElement', schemas.dataElementSchema);
var Org = mongoose.model('Org', schemas.orgSchema);

// Global variables
var globals = {
    orgName : "AHRQ",
    system : "Common Formats / Form",
	concept : "Form Name:"
};

// Adds classifications to 'orgs' collection.
var addClassification = function (system, concept) {

  Org.findOne({name: globals.orgName}).exec(function (err, ahrqOrg) {
      var found = false;
	  
	  // Create an 'orgs' collection if it doesn't exist.
	  if( ahrqOrg === null || ahrqOrg === undefined ) {
	    ahrqOrg = new Org();
	  }
	  
      if (ahrqOrg.classifications === null || ahrqOrg.classifications === undefined) {
		ahrqOrg.classifications = [];
      }
     for (var i = 0; i < ahrqOrg.classifications.length; i++) {
		 if ( ahrqOrg.classifications[i].name === system && ahrqOrg.classifications[i].elements[0].name === concept ) {
             found = true;
         }
     } 
     if (found === false) {
		ahrqOrg.name = globals.orgName;
		ahrqOrg.classifications.push({
			name: system,
            elements : [ 
                {
                    name : concept
                }
            ]
        });
		  
        ahrqOrg.save(function(err, newOrg) {
            if (err) console.log("failed to update Org: " + err);
        });
    }
  });
};

// TODO - Make this iterate over files. Otherwise, open connection is way too slow.
fs.readFile(process.argv[2], function(err, result) {
    var data = JSON.parse(result);
    console.log("Name: " + data["Name:"]);
    
    var newDE = new DataElement({
        uuid: uuid.v4()
        , created: Date.now()
        , origin: globals.orgName
        , originId: data["Data Element ID:"] + "v" + data["Version:"]
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
	
    addClassification(globals.system, data[globals.concept]);
      
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
        }
    });

    console.log('Done');
    // wait 5 secs for mongoose to do it's thing before closing.  
    setTimeout((function() {
        process.exit();
    }), 1000);
});

