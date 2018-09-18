const generateTinyId = require('../../../server/system/mongo-data').generateTinyId;
const today = new Date().toJSON();

parseDesignations = ninds => {
    let designations = [{
        designation: ninds.get('crfModuleGuideline').trim(),
        tags: []
    }];
    return designations;
};
parseDefinitions = ninds => {
    let definitions = [{
        definition: ninds.get('description').trim(),
        tags: [],
    }];
    return definitions;
};
parseSources = ninds => {
    let sources = [{
        sourceName: 'NINDS',
        updated: ninds.get('versionDate')
    }];
    return sources;
};
parseIds = ninds => {
    let formId = ninds.formId;
    let ids = [];
    let version = '';
    if (ninds.versionNum.length > 0)
        version = ninds.versionNum;
    let crfId = {
        source: 'NINDS',
        id: formId,
        version: version
    };
    if (formId && formId.length > 0)
        ids.push(crfId);
    return ids;
};
parseProperties = ninds => {
    let properties = [];
    return properties
};
parseReferenceDocuments = ninds => {
    let referenceDocuments = [];
    let uri = '';
    if (ninds.downloadLink.indexOf('http://') !== -1 || ninds.downloadLink.indexOf('https://') !== -1)
        uri = ninds.downloadLink;
    let referenceDocument = {
        uri: uri,
        source: 'NINDS'
    };
    if (referenceDocument.uri.length > 0)
        referenceDocuments.push(referenceDocument);
    return referenceDocuments;
};
parseClassification = ninds => {
    let domainSubDomain = {
        "name": "Domain",
        elements: [{
            "name": ninds.get('domainName'),
            "elements": []
        }]
    };
    if (ninds.domainName !== ninds.subDomainName) {
        domainSubDomain.elements[0].elements.push({
            "name": ninds.get('subDomainName'),
            "elements": []
        });
    }

    let elements = [];
    let diseaseElement;
    if (ninds.diseaseName === 'Traumatic Brain Injury') {
        diseaseElement = {
            name: 'Disease',
            elements: [{
                "name": ninds.diseaseName,
                "elements": [{
                    "name": ninds.subDiseaseName,
                    "elements": [{
                        "name": 'Domain',
                        "elements": [domainSubDomain]
                    }]
                }]
            }]
        };
    } else {
        diseaseElement = {
            name: 'Disease',
            elements: [{
                "name": ninds.get('diseaseName'),
                "elements": [domainSubDomain]
            }]
        };
    }
    elements.push(domainSubDomain);
    elements.push(diseaseElement);
    let classification = [{stewardOrg: {name: 'NINDS'}, elements: elements}];

    return classification;
}
exports.createForm = function (ninds) {
    let formId = ninds.get('formId');
    let designations = parseDesignations(ninds);
    let definitions = parseDefinitions(ninds);
    let sources = parseSources(ninds);
    let ids = parseids(ninds);
    let referenceDocuments = parseReferenceDocuments(ninds);
    let classification = parseClassification(ninds);
    let properties = parseProperties(ninds);
    let newForm = {
        tinyId: generateTinyId(),
        createdBy: {username: 'batchloader'},
        sources: sources,
        created: today,
        imported: today,
        isCopyrighted: ninds.get('copyright'),
        noRenderAllowed: ninds.get('copyright'),
        stewardOrg: {name: 'NINDS'},
        registrationState: {registrationStatus: "Qualified"},
        designations: designations,
        definitions: definitions,
        referenceDocuments: referenceDocuments,
        ids: ids,
        classification: classification,
        properties: properties,
        formElements: []
    };
    return newForm;
};