var entities = require("entities");
var mongo_data = require('../../../modules/system/node-js/mongo-data');
var classificationShared = require('../../../modules/system/shared/classificationShared');
var classificationMapping = require('../caDSRClassificationMapping.json');

var $attribute = 'attribute';

var datatypeMapping = {
    CHARACTER: "Text",
    NUMBER: "Number",
    ALPHANUMERIC: "Text",
    TIME: "Time",
    DATE: "Date",
    DATETIME: "Date/Time"
};

var source = 'caDSR';

function getCodeSystem(string) {
    if (string.match(/^C\d{5}/)) {
        return "NCI Thesaurus";
    }
    if (string.match(/^CL\d{5}/)) {
        return "NCI Metathesaurus";
    }
    if (string.match(/^L\d{5}/)) {
        return "LOINC";
    }
}

function parseNaming(de) {
    var naming = [{
        designation: entities.decodeXML(de.LONGNAME[0]),
        definition: entities.decodeXML(de.PREFERREDDEFINITION[0]),
        languageCode: "EN-US",
        context: {
            contextName: "Health",
            acceptability: "preferred"
        }
    }];
    if (de.REFERENCEDOCUMENTSLIST[0].REFERENCEDOCUMENTSLIST_ITEM) {
        de.REFERENCEDOCUMENTSLIST[0].REFERENCEDOCUMENTSLIST_ITEM.forEach(function (refDoc) {
            if (["Application Standard Question Text", "Preferred Question Text", "Alternate Question Text"].indexOf(refDoc.DocumentType[0]) > -1) {
                naming.push({
                    designation: entities.decodeXML(refDoc.DocumentText[0]),
                    definition: entities.decodeXML(refDoc.Name[0]),
                    languageCode: "EN-US",
                    context: {
                        contextName: refDoc.DocumentType[0],
                        acceptability: "preferred"
                    }
                });
            }
        });
    }
    return naming;
}

function parseIds(de) {
    return [{
        source: source,
        id: de.PUBLICID[0],
        version: de.VERSION[0]
    }];
}

function parseProperties(de) {
    var properties = [
        {
            key: "caDSR_Context",
            source: source,
            value: de.CONTEXTNAME[0]
        },
        {
            key: "caDSR_Short_Name",
            source: source,
            value: de.PREFERREDNAME[0]
        }
    ];
    if (de.ALTERNATENAMELIST[0] && de.ALTERNATENAMELIST[0].ALTERNATENAMELIST_ITEM.length > 0) {
        de.ALTERNATENAMELIST[0].ALTERNATENAMELIST_ITEM.forEach(function (altName) {
            if (["USED_BY"].indexOf(altName.AlternateNameType[0]) === -1) {
                properties.push({
                    key: altName.AlternateNameType[0],
                    value: entities.decodeXML(altName.AlternateName[0])
                });
            }
        });
    }
    return properties;
}

function parseRegistrationState(de, orgInfo) {
    var registrationState = {
//        registrationStatus: orgInfo.statusMapping[de.REGISTRATIONSTATUS[0]],
        registrationStatus: 'Qualified',
        administrativeStatus: de.WORKFLOWSTATUS[0]
    };
    if (!registrationState.registrationStatus) {
        registrationState.registrationStatus = orgInfo.statusMapping.default;
    }
    return registrationState;
}

function parseReferenceDocuments(de) {
    de = JSON.parse(JSON.stringify(de));
    delete de.__v;
    var referenceDocuments = [];
    if (de.REFERENCEDOCUMENTSLIST[0].REFERENCEDOCUMENTSLIST_ITEM) {
        de.REFERENCEDOCUMENTSLIST[0].REFERENCEDOCUMENTSLIST_ITEM.forEach(function (refDoc) {
            if (["Application Standard Question Text", "Preferred Question Text", "Alternate Question Text"].indexOf(refDoc.DocumentType[0]) === -1) {
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
                referenceDocuments.push(newRefDoc);
            }
        });
    }
    return referenceDocuments;
}

function parseOrigin(de) {
    var origin = '';
    if (de.ORIGIN && de.ORIGIN[0] && de.ORIGIN[0].length > 0) {
        origin = de.ORIGIN[0];
    }
    return origin;
}

function parseObjectClass(de) {
    var objectClass = {concepts: []};
    if (de.DATAELEMENTCONCEPT[0].ObjectClass[0].ConceptDetails[0].ConceptDetails_ITEM) {
        de.DATAELEMENTCONCEPT[0].ObjectClass[0].ConceptDetails[0].ConceptDetails_ITEM.forEach(function (con) {
            con.ORIGIN[0].split(":").forEach(function (c) {
                var concept = {
                    name: con.LONG_NAME[0],
                    origin: c,
                    originId: con.PREFERRED_NAME[0]
                };
                objectClass.concepts.push(concept);
            })
        });
    }
    return objectClass;
}
function parseProperty(de) {
    var property = {concepts: []};
    if (de.DATAELEMENTCONCEPT[0].Property[0].ConceptDetails[0].ConceptDetails_ITEM) {
        de.DATAELEMENTCONCEPT[0].Property[0].ConceptDetails[0].ConceptDetails_ITEM.forEach(function (con) {
            con.ORIGIN[0].split(":").forEach(function (c) {
                var concept = {
                    name: con.LONG_NAME[0],
                    origin: c,
                    originId: con.PREFERRED_NAME[0]
                };
                property.concepts.push(concept);
            })
        });
    }
    return property;
}
function parseDataElementConcept(de) {
    var dataElementConcept = {concepts: []};
    var concept = {
        name: de.DATAELEMENTCONCEPT[0].LongName[0],
        origin: "NCI caDSR",
        originId: de.DATAELEMENTCONCEPT[0].PublicId[0] + "v" + de.DATAELEMENTCONCEPT[0].Version[0]
    };
    dataElementConcept.concepts.push(concept);
    return dataElementConcept;
}

function parseClassification(cde, org, orgInfo, de) {
    if (de.CLASSIFICATIONSLIST[0].CLASSIFICATIONSLIST_ITEM) {
        de.CLASSIFICATIONSLIST[0].CLASSIFICATIONSLIST_ITEM.forEach(function (csi) {
            var getStringVersion = function (shortVersion) {
                if (shortVersion.indexOf(".") === -1) return shortVersion + ".0";
                else return shortVersion;
            };
            var classificationVersion = getStringVersion(csi.ClassificationScheme[0].Version[0]);
            try {
                var classificationName = classificationMapping[csi.ClassificationScheme[0].PublicId[0] +
                    "v" + classificationVersion].longName || "";

            } catch (e) {
                console.log(csi.ClassificationScheme[0].PublicId[0] + "v" + classificationVersion);
                throw e;
            }

            var classificationOrgName = 'NCI';
            var ctxName = csi.ClassificationScheme[0].ContextName[0];
            var classificationAllowed = csi.ClassificationSchemeItemName[0];
            if (orgInfo.filter(ctxName, classificationAllowed)) {
                classificationShared.classifyItem(cde, classificationOrgName, [ctxName, classificationName, classificationAllowed]);
                classificationShared.addCategory({elements: org.classifications}, [ctxName, classificationName, classificationAllowed]);
            }
        });
    }
}

function parseValueDomain(cde, de) {

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
            var newPv = {
                permissibleValue: entities.decodeXML(pv.VALIDVALUE[0]),
                valueMeaningName: entities.decodeXML(pv.VALUEMEANING[0]),
                valueMeaningDefinition: entities.decodeXML(pv.MEANINGDESCRIPTION[0]),
                codeSystemName: ''
            };
            if (!pv.MEANINGCONCEPTS[0][$attribute]) {
                var valueMeaningCodeString = pv.MEANINGCONCEPTS[0].replace(/,/g, ':');
/*
                var valueMeaningCodeArray = valueMeaningCodeString.split(':');
                for (var i = 0; i < valueMeaningCodeArray.length; i++) {
                    var valueMeaningCode = valueMeaningCodeArray[i];
                    var codeSystem = getCodeSystem(valueMeaningCode);
                    if (newPv.codeSystemName === '') {
                        newPv.codeSystemName = codeSystem;
                    } else if (newPv.codeSystemName !== codeSystem) {
                        newPv.codeSystemName = '';
                    } else {
                        newPv.codeSystemName = codeSystem;
                    }
                }
*/
                newPv.valueMeaningCode = valueMeaningCodeString;

            }
            cde.valueDomain.permissibleValues.push(newPv);
        });
        cde.valueDomain.permissibleValues.sort(function (pv1, pv2) {
            if (pv1.permissibleValue === pv2.permissibleValue) return 0;
            if (pv1.permissibleValue > pv2.permissibleValue) return 1;
            if (pv1.permissibleValue < pv2.permissibleValue) return -1;
        });
    }
}

exports.createNewCde = function (de, org, orgInfo, sourceObj) {
    if (de.toObject) de = de.toObject();
    sourceObj['datatype'] = de.VALUEDOMAIN[0].Datatype[0];
    sourceObj['registrationStatus'] = (de.REGISTRATIONSTATUS[0] && de.REGISTRATIONSTATUS[0].length > 0) ? de.REGISTRATIONSTATUS[0] : "";
    var naming = parseNaming(de);
    var ids = parseIds(de);
    var properties = parseProperties(de);
    var registrationState = parseRegistrationState(de, orgInfo);
    var referenceDocuments = parseReferenceDocuments(de);
    var origin = parseOrigin(de);
    var objectClass = parseObjectClass(de);
    var property = parseProperty(de);
    var dataElementConcept = parseDataElementConcept(de);
    var cde = {
        tinyId: mongo_data.generateTinyId(),
        imported: Date.now(),
        registrationState: registrationState,
        sources: [sourceObj],
        source: source,
        origin: origin,
        version: de.VERSION[0],
        valueDomain: {
            datatype: de.VALUEDOMAIN[0].Datatype[0],
            name: de.VALUEDOMAIN[0].LongName[0],
            definition: de.VALUEDOMAIN[0].PreferredDefinition[0]
        },
        stewardOrg: {name: orgInfo['stewardOrgName']},
        naming: naming,
        ids: ids,
        attachments: [],
        properties: properties,
        referenceDocuments: referenceDocuments,
        objectClass: objectClass,
        property: property,
        dataElementConcept: dataElementConcept,
        classification: []
    };
    parseClassification(cde, org, orgInfo, de);
    parseValueDomain(cde, de);

    return cde;
};