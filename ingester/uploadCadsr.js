var fs = require('fs')
    , util = require('util')
    , xml2js = require('xml2js')
    , mongoose = require('mongoose')
    , uuid = require('node-uuid')
;

var parser = new xml2js.Parser();

var mongoUri = process.env.MONGOLAB_URI || 'mongodb://localhost/nlmcde';
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

fs.readFile(process.argv[2], function(err, data) {
    parser.parseString(data, function (err, result) {

    for (var i in result.DataElementsList.DataElement) {
        console.log("---- " + i);
        var cadsrDE = result.DataElementsList.DataElement[i];
        
        if (cadsrDE.WORKFLOWSTATUS == 'DRAFT NEW') {
            cadsrDE.WORKFLOWSTATUS = 'Candidate';
        } else if (cadsrDE.WORKFLOWSTATUS == 'DRAFT MOD') {
            cadsrDE.WORKFLOWSTATUS = 'Recorded';            
        } else if (cadsrDE.WORKFLOWSTATUS == 'RELEASED') {
            cadsrDE.WORKFLOWSTATUS = 'Qualified';                        
        } if (cadsrDE.WORKFLOWSTATUS == 'APPRVD FOR TRIAL USE') {
            cadsrDE.WORKFLOWSTATUS = 'Standard';            
        }
        
        var newDE = new DataElement({
            uuid: uuid.v4()
// PreferredName as alternate name ?
//            , preferredName: cadsrDE.PREFERREDNAME
            , name: cadsrDE.LONGNAME
            , definition: cadsrDE.PREFERREDDEFINITION
            , created: Date.now()
            , origin: 'CADSR'
            , originId: cadsrDE.PUBLICID + "v" + cadsrDE.VERSION
            , registeringAuthority: {
                name: cadsrDE.CONTEXTNAME
            }
            , registrationStatus: cadsrDE.WORKFLOWSTATUS
            , version: cadsrDE.VERSION
            , valueDomain: {  
//                preferredName: cadsrDE.VALUEDOMAIN[0].PreferredName,
                            name: cadsrDE.VALUEDOMAIN[0].LongName,
                            definition: cadsrDE.VALUEDOMAIN[0].PreferredDefinition
                         }
                         
        });
        
        newDE.naming = [];
        var defaultNaming = {contextName: 'Health'};
        defaultNaming.languages = [];
        var defaultLang = {
                languageCode: 'US'
                , preferredNaming: {
                    designation: cadsrDE.LONGNAME
                    , definition: cadsrDE.PREFERREDDEFINITION
                }
            };
        defaultNaming.languages.push(defaultLang);
        newDE.naming.push(defaultNaming);
        
        for (var pvi in cadsrDE.VALUEDOMAIN[0].PermissibleValues[0].PermissibleValues_ITEM) {
            cadsrPV = cadsrDE.VALUEDOMAIN[0].PermissibleValues[0].PermissibleValues_ITEM[pvi];
            newDE.valueDomain.permissibleValues.push({validValue: cadsrPV.VALIDVALUE[0]});
        }
        
        for (var occi in cadsrDE.DATAELEMENTCONCEPT[0].ObjectClass[0].ConceptDetails[0].ConceptDetails_ITEM) {
            concept = cadsrDE.DATAELEMENTCONCEPT[0].ObjectClass[0].ConceptDetails[0].ConceptDetails_ITEM[occi];
            newDE.objectClass.concepts.push({name: concept.LONG_NAME, origin: concept.ORIGIN, originId: concept.PREFERRED_NAME});
        }
        
        for (var pci in cadsrDE.DATAELEMENTCONCEPT[0].Property[0].ConceptDetails[0].ConceptDetails_ITEM) {
            concept = cadsrDE.DATAELEMENTCONCEPT[0].Property[0].ConceptDetails[0].ConceptDetails_ITEM[pci];
            newDE.property.concepts.push({name: concept.LONG_NAME, origin: concept.ORIGIN, originId: concept.PREFERRED_NAME});
        }

            
            
//        for (var ani in cadsrDE.ALTERNATENAMELIST.ALTERNATENAMELIST_ITEM) {
//            
//        }

//        console.log(util.inspect(newDE));
        
        newDE.save(function (err, newDE) {
            if (err) {
              console.log('unable to save DE: ' + util.inspect(newDE));
              console.log(err);
            }
        });
        
    }
    console.log('Done');
    
    // wait 5 secs for mongoose to do it's thing before closing.  
    setTimeout((function() {
     process.exit();
    }), 5000);
    });
});




