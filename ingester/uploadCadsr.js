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

var phenxOrg = null;
var nidaOrg = null;
var nciOrg = null;

setTimeout(function() {
    mongo_data_system.orgByName("PhenX", function(stewardOrg) {
       phenxOrg = stewardOrg; 
    });
    mongo_data_system.orgByName("NIDA", function(stewardOrg) {
       nidaOrg = stewardOrg; 
    });
    mongo_data_system.orgByName("NCI", function(stewardOrg) {
        nciOrg = stewardOrg; 
        if (!nciOrg) {
            console.log("init NCI")
            nciOrg = {name: "NCI", classifications: []};
        }
    });
}, 100);

setTimeout(function() {
    fs.readdir(promisDir + "/forms", function(err, files) {
        if (err) {
            console.log("Cant read form dir." + err);
            process.exit(1);
        }
        async.each(files, function(cadsrFile, cb) {
            doFile(cadsrFile, cb);
        }, function(err) {
            console.log("All files finished.");
            process.exit(0);
        });
    });
}, 2000);

var doFile = function (casdrFile, fileCb) {
    fs.readFile(cadsrFile, function(err, data) {
    parser.parseString(data, function (err, result) {
        async.each(result.DataElementsList.DataElement, function(de, cb){
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
                , ids: [{
                    source: "caDSR"
                    , id: de.PUBLICID[0]
                    , version: de.VERSION[0]
                }]
            };
            if (cde.registrationState.registrationStatus === "Application") {
                cde.registrationState.registrationStatus = "Recorded";
            }
            if (de.REGISTRATIONSTATUS[0].length === 0) {
                cde.registrationState.registrationStatus = "N/A";
            }
            if (de.ORIGIN[0] && de.ORIGIN[0].length > 0) {
                cde.origin = de.ORIGIN[0];
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
            
            cde.referenceDocuments = [];
            if (de.REFERENCEDOCUMENTSLIST[0].REFERENCEDOCUMENTSLIST_ITEM) {
                de.REFERENCEDOCUMENTSLIST[0].REFERENCEDOCUMENTSLIST_ITEM.forEach(function(refDoc) {
                    if (["Preferred Question Text", "Alternate Question Text"].indexOf(refDoc.DocumentType[0]) > 0) {
                        cde.naming.push({
                            designation: refDoc.Name[0]
                            , definition: refDoc.DocumentText[0]
                            , languageCode: "EN-US"
                            , context: {
                                contextName: refDoc.DocumentType[0], 
                                acceptability: "preferred"
                            }
                        });
                    } else {
                        var newRefDoc = {
                            title: refDoc.Name[0], 
                            docType: refDoc.DocumentType[0],
                            languageCode: refDoc.Language[0]
                        };
                        if (refDoc.DocumentText[0].length > 0) {
                            newRefDoc.text = refDoc.DocumentText[0];
                        }
                        if (newRefDoc.languageCode === 'ENGLISH') newRefDoc.languageCode = "EN-US";
                        if (refDoc.OrganizationName[0].length > 0) {
                            newRefDoc.providerOrg = refDoc.OrganizationName[0];
                        }
                        if (refDoc.URL[0].length > 0) {
                            newRefDoc.url = refDoc.URL[0];
                        }
                        cde.referenceDocuments.push(newRefDoc);
                    }
                });
            }
            
            
            if (de.VALUEDOMAIN[0].ValueDomainType === 'Enumerated') {
                cde.valueDomain.datatype = "Value List";
                cde.valueDomain.datatypeValueList = {datatype: dev.VALUEDOMAIN[0].Datatype[0]};
            }
            
            if (de.VALUEDOMAIN[0].UnitOfMeasure[0].length > 0) {
                cde.valueDomain.uom = de.VALUEDOMAIN[0].UnitOfMeasure[0];
            }
            cde.valueDomain.permissibleValues = [];
            if (de.VALUEDOMAIN[0].PermissibleValues[0].PermissibleValues_ITEM) {
                de.VALUEDOMAIN[0].PermissibleValues[0].PermissibleValues_ITEM.forEach(function(pv) {
                    var newPv = 
                    {
                        permissibleValue: pv.VALIDVALUE[0], 
                        valueMeaningName: pv.VALUEMEANING[0], 
                    };
                    if (!pv.MEANINGCONCEPTS[0]['$']) {
                        newPv.valueMeaningCode = pv.MEANINGCONCEPTS[0]
                    }
                    cde.valueDomain.permissibleValues.push(newPv);
    //                if (pv.MEANINGCONCEPTS[0].length > 0) {
    //                    newPv.valueMeaningCodeSystem
    //                }
                });
            }
            cde.objectClass = {concepts: []};
            if (de.DATAELEMENTCONCEPT[0].ObjectClass[0].ConceptDetails[0].ConceptDetails_ITEM) {
                de.DATAELEMENTCONCEPT[0].ObjectClass[0].ConceptDetails[0].ConceptDetails_ITEM.forEach(function(con){
                   cde.objectClass.concepts.push({
                      name: con.LONG_NAME[0],
                      origin: con.ORIGIN[0],
                      originId: con.PREFERRED_NAME[0]
                   }); 
                });
            }
            
            cde.property = {concepts: []};
            if (de.DATAELEMENTCONCEPT[0].Property[0].ConceptDetails[0].ConceptDetails_ITEM) {
                de.DATAELEMENTCONCEPT[0].Property[0].ConceptDetails[0].ConceptDetails_ITEM.forEach(function(con){
                   cde.property.concepts.push({
                      name: con.LONG_NAME[0],
                      origin: con.ORIGIN[0],
                      originId: con.PREFERRED_NAME[0]
                   }); 
                });
            }
            
            cde.dataElementConcept = {concepts: [{
                    name: de.DATAELEMENTCONCEPT[0].LongName[0],
                    origin: "NCI caDSR",
                    originId: de.DATAELEMENTCONCEPT[0].PublicId[0] + "v" + de.DATAELEMENTCONCEPT[0].Version[0]
            }]};
        
            cde.classification = [];
        
            if (de.CLASSIFICATIONSLIST[0].CLASSIFICATIONSLIST_ITEM)
            de.CLASSIFICATIONSLIST[0].CLASSIFICATIONSLIST_ITEM.forEach(function(csi) {
                if (csi.ClassificationScheme[0].PreferredName[0].length > 0 &&
                        csi.ClassificationSchemeItemName[0].length > 0) {
                    if (csi.ClassificationScheme[0].ContextName[0] === "caBIG" &&
                            csi.ClassificationScheme[0].PreferredName[0] === "PhenX") {                        
                        classificationShared.classifyItem(cde, "PhenX", ['PhenX', csi.ClassificationSchemeItemName[0]]);
                        classificationShared.addCategory({elements: phenXOrg.classifications}, ["PhenX", csi.ClassificationSchemeItemName[0]]);
                    } else if (csi.ClassificationScheme[0].ContextName[0] === "NIDA") {                        
                        classificationShared.classifyItem(cde, "NIDA", ['NIDA', csi.ClassificationSchemeItemName[0]]);
                        classificationShared.addCategory({elements: nidaOrg.classifications}, ["NIDA", csi.ClassificationSchemeItemName[0]]);
                    } else {
                        classificationShared.classifyItem(cde, "NCI", [csi.ClassificationScheme[0].PreferredName[0], csi.ClassificationSchemeItemName[0]]);
                        classificationShared.addCategory({elements: nciOrg.classifications}, [csi.ClassificationScheme[0].PreferredName[0], csi.ClassificationSchemeItemName[0]]);
                    }
                }
            });

            
            
            mongo_cde.create(cde, {username: 'loader'}, function(err, newCde) {
               if (err) {
                   console.log("unable to create CDE. " + JSON.stringify(cde) );
                   console.log(err);
                   process.exit(1);
               } else {
                   
               }
               cb();
            });              
        }, function(err){
            fileCb();
        });            
    });
});
};


