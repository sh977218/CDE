var fs = require('fs'),
    MigrationNCICdeXmlModel = require('../createConnection').MigrationNCICdeXmlModel,
    async = require('async'),
    entities = require("entities"),
    MigrationDataElementModel = require('../createConnection').MigrationDataElementModel,
    MigrationOrgModel = require('../createConnection').MigrationOrgModel,
    classificationShared = require('../../modules/system/shared/classificationShared'),
    mongo_data_system = require('../../modules/system/node-js/mongo-data'),
    classificationMapping = require('./caDSRClassificationMapping.json')
    ;


var orgName = 'NCI';
var nciOrg;
var deCount = 0;
var badDe = [];

var datatypeMapping = {
    CHARACTER: "Text",
    NUMBER: "Number",
    ALPHANUMERIC: "Text",
    TIME: "Time",
    DATE: "Date",
    DATETIME: "Date/Time"
};

function convertCadsrStatusToNlmStatus(status) {
    switch (status) {
        case "Preferred Standard":
        case "Standard":
            return "Standard";
        case "Candidate":
        case "Recorded":
            return "Recorded";
        case "Qualified":
            return "Candidate";
        case "Proposed":
        default:
            return "Incomplete";
    }
}

function createNewCde(de) {
    if (de.toObject) de = de.toObject();
    if (de.REGISTRATIONSTATUS[0] === "Retired" || de.REGISTRATIONSTATUS[0] === "Historical") {
        console.log('de is retired or historical');
        return null;
    }
    var cde = {
        registrationState: {
            registrationStatus: convertCadsrStatusToNlmStatus(de.REGISTRATIONSTATUS[0]),
            administrativeStatus: de.WORKFLOWSTATUS[0]
        },
        tinyId: mongo_data_system.generateTinyId(),
        imported: Date.now(),
        source: 'caDSR',
        version: '1',
        valueDomain: {
            datatype: de.VALUEDOMAIN[0].Datatype[0],
            name: de.VALUEDOMAIN[0].LongName[0],
            definition: de.VALUEDOMAIN[0].PreferredDefinition[0]
        },
        stewardOrg: {name: "NCI"},
        naming: [
            {
                designation: entities.decodeXML(de.LONGNAME[0]),
                definition: entities.decodeXML(de.PREFERREDDEFINITION[0]),
                languageCode: "EN-US",
                context: {
                    contextName: "Health",
                    acceptability: "preferred"
                }
            }
        ],
        ids: [{
            source: "caDSR",
            id: de.PUBLICID[0],
            version: de.VERSION[0]
        }],
        attachments: [],
        properties: [
            {
                key: "caDSR_Context",
                value: de.CONTEXTNAME[0]
            },
            {
                key: "caDSR_Datatype",
                value: de.VALUEDOMAIN[0].Datatype[0]
            },
            {
                key: "caDSR_Short_Name",
                value: de.PREFERREDNAME[0]
            },
            {
                key: "caDSR_Registration_Status",
                value: (de.REGISTRATIONSTATUS[0] && de.REGISTRATIONSTATUS[0].length > 0) ? de.REGISTRATIONSTATUS[0] : "Empty"
            }
        ]
    };

    if (de.ORIGIN && de.ORIGIN[0] && de.ORIGIN[0].length > 0) {
        cde.origin = de.ORIGIN[0];
    }

    if (de.ALTERNATENAMELIST[0] && de.ALTERNATENAMELIST[0].ALTERNATENAMELIST_ITEM.length > 0) {
        de.ALTERNATENAMELIST[0].ALTERNATENAMELIST_ITEM.forEach(function (altName) {
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
    if (cde.valueDomain.datatype === 'Number') {
        cde.valueDomain.datatypeNumber = {};
        if (de.VALUEDOMAIN[0].MaximumValue[0].length > 0) {
            cde.valueDomain.datatypeNumber.maxValue = de.VALUEDOMAIN[0].MaximumValue[0];
        }
        if (de.VALUEDOMAIN[0].MinimumValue[0].length > 0) {
            cde.valueDomain.datatypeNumber.minValue = de.VALUEDOMAIN[0].MinimumValue[0];
        }
        if (de.VALUEDOMAIN[0].DecimalPlace[0].length > 0) {
            cde.valueDomain.datatypeNumber.precision = de.VALUEDOMAIN[0].DecimalPlace[0];
        }
    }
    if (cde.valueDomain.datatype === 'Text') {
        cde.valueDomain.datatypeText = {};
        if (de.VALUEDOMAIN[0].MaximumLength[0].length > 0) {
            cde.valueDomain.datatypeText.maxLength = de.VALUEDOMAIN[0].MaximumLength[0];
        }
        if (de.VALUEDOMAIN[0].MinimumLength[0].length > 0) {
            cde.valueDomain.datatypeText.minLength = de.VALUEDOMAIN[0].MinimumLength[0];
        }
    }

    cde.referenceDocuments = [];
    if (de.REFERENCEDOCUMENTSLIST[0].REFERENCEDOCUMENTSLIST_ITEM) {
        de.REFERENCEDOCUMENTSLIST[0].REFERENCEDOCUMENTSLIST_ITEM.forEach(function (refDoc) {
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
        cde.valueDomain.datatypeValueList = {datatype: cde.valueDomain.datatype};
        cde.valueDomain.datatype = "Value List";
    }

    if (de.VALUEDOMAIN[0].UnitOfMeasure[0].length > 0) {
        cde.valueDomain.uom = de.VALUEDOMAIN[0].UnitOfMeasure[0];
    }
    cde.valueDomain.permissibleValues = [];
    if (de.VALUEDOMAIN[0].PermissibleValues[0].PermissibleValues_ITEM) {
        de.VALUEDOMAIN[0].PermissibleValues[0].PermissibleValues_ITEM.forEach(function (pv) {
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
        });
        cde.valueDomain.permissibleValues.sort(function (pv1, pv2) {
            if (pv1.permissibleValue === pv2.permissibleValue) return 0;
            if (pv1.permissibleValue > pv2.permissibleValue) return 1;
            if (pv1.permissibleValue < pv2.permissibleValue) return -1;
        });
    }


    cde.objectClass = {concepts: []};
    if (de.DATAELEMENTCONCEPT[0].ObjectClass[0].ConceptDetails[0].ConceptDetails_ITEM) {
        de.DATAELEMENTCONCEPT[0].ObjectClass[0].ConceptDetails[0].ConceptDetails_ITEM.forEach(function (con) {
            cde.objectClass.concepts.push({
                name: con.LONG_NAME[0],
                origin: con.ORIGIN[0],
                originId: con.PREFERRED_NAME[0]
            });
        });
    }

    cde.property = {concepts: []};
    if (de.DATAELEMENTCONCEPT[0].Property[0].ConceptDetails[0].ConceptDetails_ITEM) {
        de.DATAELEMENTCONCEPT[0].Property[0].ConceptDetails[0].ConceptDetails_ITEM.forEach(function (con) {
            cde.property.concepts.push({
                name: con.LONG_NAME[0],
                origin: con.ORIGIN[0],
                originId: con.PREFERRED_NAME[0]
            });
        });
    }

    cde.dataElementConcept = {
        concepts: [{
            name: de.DATAELEMENTCONCEPT[0].LongName[0],
            origin: "NCI caDSR",
            originId: de.DATAELEMENTCONCEPT[0].PublicId[0] + "v" + de.DATAELEMENTCONCEPT[0].Version[0]
        }]
    };

    cde.classification = [];

    if (de.CLASSIFICATIONSLIST[0].CLASSIFICATIONSLIST_ITEM)
        de.CLASSIFICATIONSLIST[0].CLASSIFICATIONSLIST_ITEM.forEach(function (csi) {
            var getStringVersion = function (shortVersion) {
                if (shortVersion.indexOf(".") === -1) return shortVersion + ".0";
                else return shortVersion;
            };
            var classifVersion = getStringVersion(csi.ClassificationScheme[0].Version[0]);
            try {
                var classifName = classificationMapping[csi.ClassificationScheme[0].PublicId[0] + "v" + classifVersion].longName || "";

            } catch (e) {
                console.log(csi.ClassificationScheme[0].PublicId[0] + "v" + classifVersion);
                throw e;
            }
            var classifStatus = classificationMapping[csi.ClassificationScheme[0].PublicId[0] + "v" + classifVersion].workflowStatusName;
            if (classifStatus === 'RELEASED' && classifName.length > 0 &&
                csi.ClassificationSchemeItemName[0].length > 0) {
                if (csi.ClassificationScheme[0].ContextName[0] === "NIDA") {
                    if (['Standard', 'Preferred Standard'].indexOf(cde.registrationState.registrationStatus) < 0) {
                        cde.registrationState.registrationStatus = "Qualified";
                    }
                }
                classificationShared.classifyItem(cde, "NCI", [csi.ClassificationScheme[0].ContextName[0], classifName, csi.ClassificationSchemeItemName[0]]);
                classificationShared.addCategory({elements: nciOrg.classifications}, [csi.ClassificationScheme[0].ContextName[0], classifName, csi.ClassificationSchemeItemName[0]]);
            }
        });
    return cde;
}

function run() {
    async.series([
        function (cb) {
            MigrationDataElementModel.remove({}, function (err) {
                console.log('removed all doc in migration dataelements collection');
                if (err) throw err;
                MigrationOrgModel.remove({}, function (er) {
                    if (er) throw er;
                    new MigrationOrgModel({name: orgName}).save(function (e, org) {
                        if (e) throw e;
                        console.log('create new org of ' + orgName + ' in migration db');
                        nciOrg = org;
                        cb();
                    });
                });
            });
        },
        function (cb) {
            var stream = MigrationNCICdeXmlModel.find({}).stream();
            stream.on('data', function (xml) {
                var newCde = createNewCde(xml);
                if (newCde) {
                    MigrationDataElementModel.find({'ids.id': newCde.ids[0].id}).elemMatch("ids", newCde.ids[0]).exec(function (err, existingCdes) {
                        if (err) throw err;
                        if (existingCdes.length === 0) {
                            var obj = new MigrationDataElementModel(newCde);
                            obj.save(function () {
                                deCount++;
                                console.log('deCount: ' + deCount);
                                stream.resume();
                            });
                        }
                        else if (existingCdes.length === 1) {
                            console.log('find 1 existing Cde of id:' + newCde.ids[0].id);
                            process.exit(1);
                        } else {
                            console.log('find more than 1 existing Cdes of id:' + newCde.ids[0].id);
                            process.exit(1);
                        }
                    })
                } else {
                    badDe.push(xml);
                    stream.resume();
                }
            });
            stream.on('end', function (err) {
                console.log("End of NCI stream.");
                if (err) throw err;
                nciOrg.markModified('classifications');
                nciOrg.save(function (e) {
                    if (e) throw e;
                    if (cb) cb();
                    //noinspection JSUnresolvedVariable
                    else process.exit(0);
                });
            });
        },
        function () {
            console.log('finished all xml');
            console.log('deCount: ' + deCount);
            console.log('badDeCount: ' + badDe.length);
            console.log('bad De: ' + JSON.stringify(badDe));
            process.exit(1);
        }
    ]);
}


run();