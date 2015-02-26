var fs = require('fs'),
    https = require('https'),
    mongo_cde = require('../modules/cde/node-js/mongo-cde'),
    config = require('config'),
    classificationShared = require('../modules/system/shared/classificationShared'),
    mongo_data_system = require('../modules/system/node-js/mongo-data'),
    async = require ('async')
    , xml2js = require('xml2js')
    , shortid = require('shortid')
        ;

var parser = new xml2js.Parser();

var cadsrFile = process.argv[2];
if (!cadsrFile) {
    console.log("missing cadsrFile arg");
    process.exit(1);
}

var datatypeMapping = {
    CHARACTER: "Text"
    , NUMBER: "Float"
    , ALPHANUMERIC: "Text"
    , TIME: "Time"
    , DATE: "Date"
    , DATETIME: "Date/Time"
};

fs.readFile(cadsrFile, function(err, data) {
    parser.parseString(data, function (err, result) {        
        result.DataElementsList.DataElement.forEach(function(de) {
            var cde = {
                registrationState: {
                    registrationStatus: de.REGISTRATIONSTATUS[0]   
                    , administrativeStatus: de.WORKFLOWSTATUS[0]
                }
                , tinyId: shortid.generate()
                , imported: Date.now()
                , source: 'caDSR'
                , version: '1'
                , valueDomain: {
                    datatype: de.VALUEDOMAIN[0].Datatype[0]
                    , name: de.VALUEDOMAIN[0].LongName[0]
                }
                , stewardOrg: {name: "NCI"}
                , naming: [
                    {
                        designation: de.LONGNAME[0]
                        , definition: de.PREFERREDDEFINITION[0]
                        , languageCode: "EN-US"
                        , context: {
                            contextName: "Health", 
                            acceptability: "preferred"
                        }
                    }
                ]
            };
            if (cde.registrationState.registrationStatus === "Application") {
                cde.registrationState.registrationStatus = "Recorded";
            }
            if (de.REGISTRATIONSTATUS[0].length === 0) {
                cde.registrationState.registrationStatus = "Empty";
            }
            if (de.ORIGIN[0] && de.ORIGIN[0].length > 0) {
                cde.origin = de.ORIGIN[0];
            }
            if (de.CONTEXTNAME[0] === 'NIDA') {
                cde.stewardOrg.name = 'NIDA';
            }
            if (datatypeMapping[cde.valueDomain.datatype]) {
                cde.valueDomain.datatype = datatypeMapping[cde.valueDomain.datatype];
            }
            if (cde.valueDomain.datatype === 'Float') {
                cde.datatypeFloat = {};
                if (de.VALUEDOMAIN[0].MaximumValue[0].length > 0) {
                    cde.datatypeFloat.maxValue = de.VALUEDOMAIN[0].MaximumValue[0];
                } 
                if (de.VALUEDOMAIN[0].MinimumValue[0].length > 0) {
                    cde.datatypeFloat.minValue = de.VALUEDOMAIN[0].MinimumValue[0];
                } 
                if (de.VALUEDOMAIN[0].DecimalPlace[0].length > 0) {
                    cde.datatypeFloat.precision = de.VALUEDOMAIN[0].DecimalPlace[0];
                } 
            }
            if (cde.valueDomain.datatype === 'Text') {
                cde.datatypeText = {};
                if (de.VALUEDOMAIN[0].MaximumLength[0].length > 0) {
                    cde.datatypeText.maxValue = de.VALUEDOMAIN[0].MaximumLength[0];
                } 
                if (de.VALUEDOMAIN[0].MinimumLength[0].length > 0) {
                    cde.datatypeText.minValue = de.VALUEDOMAIN[0].MinimumLength[0];
                }             
            }
            
            mongo_cde.create(cde, {username: 'loader'}, function(err, newCde) {
               if (err) {
                   console.log("unable to create CDE. " + err);
               } else {
                   console.log("created cde");
               }
            });              
            
            
            
        });            
    });
});