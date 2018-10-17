var entities = require("entities");
var mongo_data = require('../../../server/system/mongo-data');
var classificationShared = require('@std/esm')(module)('../../../shared/system/classificationShared');
var classificationMapping = require('../classificationMapping/caDSRClassificationMapping.json');

var $attribute = 'attribute';



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

function parseRegistrationState(de, orgInfo) {
    var registrationState = {
        registrationStatus: 'Qualified',
        administrativeStatus: de.WORKFLOWSTATUS[0]
    };
    if (!registrationState.registrationStatus) {
        registrationState.registrationStatus = orgInfo.statusMapping.default;
    }
    return registrationState;
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
            var _ctxName = ctxName;
            if (orgInfo.classificationMap) {
                if (orgInfo.mapAllClassification)
                    _ctxName = orgInfo.mapAllClassification;
                else
                _ctxName = orgInfo.classificationMap[orgInfo.orgName];
            }
            var classificationAllowed = csi.ClassificationSchemeItemName[0];
            if (orgInfo.filter(ctxName, classificationAllowed)) {
                if (orgInfo.mapAllClassification) {
                    classificationShared.classifyItem(cde, classificationOrgName, [_ctxName]);
                } else {
                    classificationShared.classifyItem(cde, classificationOrgName, [_ctxName, classificationName]);
                }
                classificationShared.addCategory({elements: org.classifications}, [_ctxName, classificationName]);
            }
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