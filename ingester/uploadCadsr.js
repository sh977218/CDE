var fs = require('fs'),
    https = require('https'),
    mongo_cde = require('../modules/cde/node-js/mongo-cde'),
    config = require('config'),
    classificationShared = require('../modules/system/shared/classificationShared'),
    mongo_data_system = require('../modules/system/node-js/mongo-data'),
    async = require ('async')
    , xml2js = require('xml2js')
    , shortid = require('shortid')
    , cadsrClassifs = require('./cadsrClassifs')
    , Readable = require('stream').Readable
    , entities = require("entities")
        ;

var parser = new xml2js.Parser();
var builder = new xml2js.Builder();

//  for f in $(find ../nlm-seed/ExternalCDEs/caDSR/xml_cde_20151510354/  -name *.xml); do  node ingester/uploadCadsr.js $f ; done

var classifMapping = {};
cadsrClassifs.shift();
var cadsrClassifMap = cadsrClassifs.forEach(function(classif) {
    if (classif.FIELD19 === 'RELEASED') {
        classifMapping[classif.FIELD14 + "v" + classif.FIELD17] = classif.FIELD9;
    }
});

var cadsrFolder = process.argv[2];
if (!cadsrFolder) {
    console.log("missing cadsrFolder arg");
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
            nciOrg = {name: "NCI", classifications: []};
        }
    });
}, 1000);

var doFile = function (cadsrFile, fileCb) {
  console.log("starting " + cadsrFile);
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
                    , definition: de.VALUEDOMAIN[0].PreferredDefinition[0]
                }
                , stewardOrg: {name: "NCI"}
                , naming: [
                    {
                        designation: entities.decodeXML(de.LONGNAME[0])
                        , definition: entities.decodeXML(de.PREFERREDDEFINITION[0])
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
                , attachments: []
                , properties: [
                    {key: "caDSR_Context", value: de.CONTEXTNAME[0]}
                    , {key: "caDSR_Datatype", value: de.VALUEDOMAIN[0].Datatype[0]}
                    , {key: "caDSR_Short_Name", value: de.PREFERREDNAME[0]}
                ]
            };
            if (cde.registrationState.registrationStatus === "Application" || cde.registrationState.registrationStatus === "Proposed") {
                cde.registrationState.registrationStatus = "Recorded";
            } 
            if (cde.registrationState.registrationStatus['$']) {
                cde.registrationState.registrationStatus = "Recorded";
            }
            if (de.ORIGIN[0] && de.ORIGIN[0].length > 0) {
                cde.origin = de.ORIGIN[0];
            }
            
            if (de.ALTERNATENAMELIST[0] && de.ALTERNATENAMELIST[0].ALTERNATENAMELIST_ITEM.length > 0) {
                de.ALTERNATENAMELIST[0].ALTERNATENAMELIST_ITEM.forEach(function(altName) {
                    if (["USED_BY"].indexOf(altName.AlternateNameType[0]) > -1) {
                        return;
                    }
                    cde.properties.push({
                        key: altName.AlternateNameType[0]
                        , value: entities.decodeXML(altName.AlternateName[0])
                    });
                });
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
                    cde.datatypeText.maxLength = de.VALUEDOMAIN[0].MaximumLength[0];
                } 
                if (de.VALUEDOMAIN[0].MinimumLength[0].length > 0) {
                    cde.datatypeText.minLength = de.VALUEDOMAIN[0].MinimumLength[0];
                }             
            }
            
            cde.referenceDocuments = [];
            if (de.REFERENCEDOCUMENTSLIST[0].REFERENCEDOCUMENTSLIST_ITEM) {
                de.REFERENCEDOCUMENTSLIST[0].REFERENCEDOCUMENTSLIST_ITEM.forEach(function(refDoc) {
                    if (["Application Standard Question Text", "Preferred Question Text", "Alternate Question Text"].indexOf(refDoc.DocumentType[0]) > -1) {
                        cde.naming.push({
                            designation: entities.decodeXML(refDoc.DocumentText[0])
                            , definition: entities.decodeXML(refDoc.Name[0])
                            , languageCode: "EN-US"
                            , context: {
                                contextName: refDoc.DocumentType[0], 
                                acceptability: "preferred"
                            }
                        });
                    } else {
                        var newRefDoc = {
                            title: entities.decodeXML(refDoc.Name[0]), 
                            docType: refDoc.DocumentType[0],
                            languageCode: refDoc.Language[0]
                        };
                        if (refDoc.DocumentText[0].length > 0) {
                            newRefDoc.text = entities.decodeXML(refDoc.DocumentText[0]);
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
            
            if (de.VALUEDOMAIN[0].ValueDomainType[0] === 'Enumerated') {
                cde.valueDomain.datatype = "Value List";
                cde.valueDomain.datatypeValueList = {datatype: de.VALUEDOMAIN[0].Datatype[0]};
            }
            
            if (de.VALUEDOMAIN[0].UnitOfMeasure[0].length > 0) {
                cde.valueDomain.uom = de.VALUEDOMAIN[0].UnitOfMeasure[0];
            }
            cde.valueDomain.permissibleValues = [];
            if (de.VALUEDOMAIN[0].PermissibleValues[0].PermissibleValues_ITEM) {
                de.VALUEDOMAIN[0].PermissibleValues[0].PermissibleValues_ITEM.forEach(function(pv) {
                    var newPv = 
                    {
                        permissibleValue: entities.decodeXML(pv.VALIDVALUE[0]), 
                        valueMeaningName: entities.decodeXML(pv.VALUEMEANING[0]),
                        valueMeaningDefinition: entities.decodeXML(pv.MEANINGDESCRIPTION[0])
                    };
                    if (!pv.MEANINGCONCEPTS[0]['$']) {
                        newPv.valueMeaningCode = pv.MEANINGCONCEPTS[0];
                    }
                    cde.valueDomain.permissibleValues.push(newPv);
    //                if (pv.MEANINGCONCEPTS[0].length > 0) {
    //                    newPv.valueMeaningCodeSystem
    //                }
                });
                cde.valueDomain.permissibleValues.sort(function(pv1, pv2) {
                    if (pv1.permissibleValue === pv2.permissibleValue) return 0;
                    if (pv1.permissibleValue > pv2.permissibleValue) return 1;
                    if (pv1.permissibleValue < pv2.permissibleValue) return -1;
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
                var classifName = classifMapping[csi.ClassificationScheme[0].PublicId[0] + "v" + csi.ClassificationScheme[0].Version[0]] || "";
                if (classifName.length > 0 &&
                        csi.ClassificationSchemeItemName[0].length > 0) {
                    if (csi.ClassificationScheme[0].ContextName[0] === "caBIG" &&
                            classifName === "PhenX") {                        
                        classificationShared.classifyItem(cde, "PhenX", ['PhenX', csi.ClassificationSchemeItemName[0]]);
                        classificationShared.addCategory({elements: phenxOrg.classifications}, ["PhenX", csi.ClassificationSchemeItemName[0]]);
                    } else if (csi.ClassificationScheme[0].ContextName[0] === "NIDA") {                        
                        classificationShared.classifyItem(cde, "NIDA", [classifName, csi.ClassificationSchemeItemName[0]]);
                        classificationShared.addCategory({elements: nidaOrg.classifications}, ["NIDA", csi.ClassificationSchemeItemName[0]]);
                    } else {
                        classificationShared.classifyItem(cde, "NCI", [csi.ClassificationScheme[0].ContextName[0], classifName, csi.ClassificationSchemeItemName[0]]);
                        classificationShared.addCategory({elements: nciOrg.classifications}, [csi.ClassificationScheme[0].ContextName[0], classifName, csi.ClassificationSchemeItemName[0]]);
                    }
                }
            });

            
            
            mongo_cde.create(cde, {username: 'batchloader'}, function(err, newCde) {
               if (err) {
                   console.log("unable to create CDE. " + JSON.stringify(cde) );
                   console.log(err);
                   process.exit(1);
               } else {
                   var stream = new Readable();
                   var origXml = builder.buildObject(de).toString();
                   stream.push(origXml);
                   stream.push(null);
                   mongo_data_system.addAttachment(
                    {originalname: cde.ids[0].id + "v" + cde.ids[0].version + ".xml", type: "application/xml", size: origXml.length, stream: stream},
                    {_id: null, username: "batchloader"}, "Original XML File", newCde, function() {
                         cb();
                     });
                     setTimeout(function() {
                        stream.emit('close'); 
                     }, 500);
               }
            });              
        }, function(err){
            fileCb();
        });            
    });
});
};


setTimeout(function() {
    if (fs.lstatSync(cadsrFolder).isDirectory()) {
        fs.readdir(cadsrFolder, function(err, files) {
            if (err) {
                console.log("Cant read folder dir." + err);
                process.exit(1);
            }
            async.eachSeries(files, function(cadsrFile, cb) {
                doFile(cadsrFolder + cadsrFile, cb);
            }, function(err) {
                console.log("All files finished.");
                process.exit(0);
            });
        });

    } else {
        doFile(cadsrFolder, function() {
            console.log("single file done");
            process.exit(0);
        });
    }
}, 2000);
