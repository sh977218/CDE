const generateTinyId = require('../../../server/system/mongo-data').generateTinyId;
const today = new Date().toJSON();

parseDesignations = ninds => {
    let designations = [{
        designation: ninds.crfModuleGuideline.trim(),
        tags: []
    }];
    return designations;
};
parseDefinitions = ninds => {
    let definitions = [{
        definition: ninds.description.trim(),
        tags: [],
    }];
    return definitions;
};
parseSources = ninds => {
    let sources = [{
        sourceName: 'NINDS',
        updated: ninds.versionDate
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
    if (formId && formId.length > 0) ids.push(crfId);
    return ids;
};
parseProperties = ninds => {
    let properties = [];
    return properties
};
parseReferenceDocuments = ninds => {
    let referenceDocuments = [];
    if (ninds.downloadLink) _.trim(ninds.downloadLink);
    if (ninds.downloadLink !== 'No references available') {
        let refWords = _.words(ninds.downloadLink, /[^\s]+/g);
        let reference = refWords.join(" ");
        let uriIndex = refWords.indexOf('http://www.');
        if (!uriIndex) uriIndex = refWords.indexOf('https://www.');
        referenceDocuments.push({
            title: reference,
            uri: uriIndex === -1 ? '' : refWords[uriIndex],
            source: 'NINDS'
        });
    }
    return referenceDocuments;
};
parseClassification = ninds => {
    let domainSubDomain = {
        name: "Domain",
        elements: [{
            name: ninds.domainName,
            elements: []
        }]
    };
    if (ninds.domainName !== ninds.subDomainName) {
        domainSubDomain.elements[0].elements.push({
            name: ninds.subDomainName,
            elements: []
        });
    }

    let elements = [];
    let diseaseElement;
    if (ninds.diseaseName === 'Traumatic Brain Injury') {
        diseaseElement = {
            name: 'Disease',
            elements: [{
                name: ninds.diseaseName,
                elements: [{
                    name: ninds.subDiseaseName,
                    elements: [{
                        name: 'Domain',
                        elements: [domainSubDomain]
                    }]
                }]
            }]
        };
    } else {
        diseaseElement = {
            name: 'Disease',
            elements: [{
                name: ninds.diseaseName,
                elements: [domainSubDomain]
            }]
        };
    }
    elements.push(domainSubDomain);
    elements.push(diseaseElement);
    let classification = [{stewardOrg: {name: 'NINDS'}, elements: elements}];

    return classification;
};

exports.createForm = function (ninds, org) {
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