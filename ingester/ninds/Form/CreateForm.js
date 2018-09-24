const generateTinyId = require('../../../server/system/mongo-data').generateTinyId;
const DataElement = require('../../../server/cde/mongo-cde').DataElement;

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
parseFormElements = async ninds => {
    if (ninds.cdes.length === 0) return [];
    let formElements = [{
        elementType: 'section',
        instructions: {value: ''},
        label: '',
        formElements: []
    }];
    for (let cde of ninds.cdes) {
        let existingCde = await DataElement.findOne({
            archived: false,
            "registrationState.registrationStatus": {$ne: "Retired"},
            'ids.id': cde.cdeId
        });

    }
    formElements.push();

    return formElements;
};
exports.createForm = function (ninds, org) {
    let designations = parseDesignations(ninds);
    let definitions = parseDefinitions(ninds);
    let sources = parseSources(ninds);
    let ids = parseIds(ninds);
    let properties = parseProperties(ninds);
    let referenceDocuments = parseReferenceDocuments(ninds);
    let formElements = parseFormElements(ninds);

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