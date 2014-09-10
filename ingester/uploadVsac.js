var fs = require('fs')
    , util = require('util')
    , xml2js = require('xml2js')
    , mongoose = require('mongoose')
    , shortid = require('shortid')
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

var orgMap = {
    "Oklahoma Foundation for Medical Quality": "OFMQ"
    , "National Library of Medicine": "NLM"
    , "Joint Commission": "Joint Commission"
    , "American Medical Association-convened Physician Consortium for Performance Improvement(R)": "AMAPCPI"
    , "PHDSC": "PHDSC"
    , "CDC NCHS": "CDC-NCHS"
    , "Lantana": "Lantana"
    , "National Quality Forum": "NQF"
    , "National Committee for Quality Assurance": "NCQA"
    , "Telligen": "Telligen"
    , "California Maternal Quality Care Collaborative": "CMQCC"
    , "Quality Insights of Pennsylvania": "QIP"
    , "Centers for Medicare & Medicaid Services": "CMS"
    , "CDC National Center on Birth Defects and Developmental Disabilities": "CDC-NCBDDD"
    , "American Board of Internal Medicine": "ABIM"
};

fs.readFile(process.argv[2], function(err, data) {
    parser.parseString(data, function (err, result) {
        for (var i = 0; i < result['ns0:RetrieveMultipleValueSetsResponse']['ns0:DescribedValueSet'].length; i++) {
            var valueSet = result['ns0:RetrieveMultipleValueSetsResponse']['ns0:DescribedValueSet'][i];
            
            if (valueSet['ns0:Type'] == 'Extensional') {

                console.log("Name: " + valueSet['$'].displayName);
                console.log("        Definition: " + valueSet['ns0:Definition']);

                var newDE = new DataElement({
                    tinyId: shortid.generate()
                    , created: Date.now()
                    , source: 'VSAC'
                    , sourceId: valueSet['$'].ID + "v" + valueSet['$'].version
                    , stewardOrg: {
                        name: orgMap[valueSet['ns0:Source']]
                    }
                    , registrationState: {
                        registrationStatus: 'Qualified'
                    }
                    , version: '1'
                    , dataElementConcept : {
                        conceptualDomain : {
                                vsac : {
                                        id : valueSet['$'].ID
                                        , name : valueSet['$'].displayName
                                        , version :  valueSet['$'].version
                                }
                        }
                    }
                    , valueDomain: {  
                        datatype: 'Value List'
                     }    
                });

                for (var pvi = 0; pvi < valueSet['ns0:ConceptList'][0]['ns0:Concept'].length; pvi++) {
                    var concept = valueSet['ns0:ConceptList'][0]['ns0:Concept'][pvi];
                    newDE.valueDomain.permissibleValues.push(
                        {
                            permissibleValue : concept['$'].displayName
                            , valueMeaningName : concept['$'].displayName
                            , valueMeaningCode : concept['$'].code
                            , codeSystemName: concept['$'].codeSystemName
                            , codeSystemVersion: concept['$'].codeSystemVersion
                        });
                }

                newDE.naming = [];
                var defaultNaming = {
                   designation: valueSet['$'].displayName
                   , definition: valueSet['ns0:Definition']
                   , languageCode: "EN-US" 
                   , context: {
                        contextName: 'Health'
                        , acceptability: "preferred"
                   }
                };
                newDE.naming.push(defaultNaming);

                newDE.save(function (err, newDE) {
                    if (err) {
                      console.log('unable to save DE: ' + util.inspect(newDE));
                      console.log(err);
                    }
                });
            }
        }
        console.log('Done');

        // wait 5 secs for mongoose to do it's thing before closing.  
        setTimeout((function() {
            process.exit();
        }), 5000);
    });
});