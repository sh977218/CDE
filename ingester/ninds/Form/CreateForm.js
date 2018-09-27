const _ = require('lodash');

const generateTinyId = require('../../../server/system/mongo-data').generateTinyId;
const DataElement = require('../../../server/cde/mongo-cde').DataElement;

const CreateCDE = require('../CDE/CreateCDE');
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
parseFormElements = ninds => {
    return new Promise(async (resolve, reject) => {
        if (ninds.cdes.length === 0) resolve([]);
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
            if (!existingCde) {
                console.log('cde: ' + cde.cdeId + ' not found.');
                throw new Error('cde: ' + cde.cdeId + ' not found.');
            }
            let existingV = (existingCde.ids.filter(o => o.source === 'NINDS'))[0].version;
            if (Number.parseFloat(existingV) !== Number.parseFloat(cde.versionNum)) {
                console.log('existing cde ' + existingV + 'not match cde: ' + cde.versionNum);
                throw new Error('version not match');
            }
            let question = {
                cde: {
                    tinyId: existingCde.tinyId,
                    name: existingCde.designations[0].designation,
                    designations: existingCde.designations,
                    version: existingCde.version,
                    ids: existingCde.ids
                },
                datatype: existingCde.valueDomain.datatype,
                uom: existingCde.valueDomain.uom
            };
            if (question.datatype === 'Value List') {
                question.answers = CreateCDE.parsePermissibleValues(cde);
                question.cde.permissibleValues = CreateCDE.parsePermissibleValues(cde);
                question.multiselect = cde.inputRestrictions === 'Multiple Pre-Defined Values Selected';
            } else if (question.datatype === 'Text') {
                question.datatypeText = existingCde.valueDomain.datatypeText;
            } else if (question.datatype === 'Number') {
                question.datatypeNumber = existingCde.valueDomain.datatypeNumber;
            } else if (question.datatype === 'Date') {
                question.datatypeDate = existingCde.valueDomain.datatypeDate;
            } else if (question.datatype === 'File') {
                question.datatypeDate = existingCde.valueDomain.datatypeDate;
            } else {
                throw 'Unknown question.datatype: ' + question.datatype + ' cde id: ' + existingCde.ids[0].id;
            }

            formElements[0].formElements.push({
                elementType: 'question',
                instructions: {value: cde.instruction},
                question: question,
                formElements: []
            });
        }
        resolve(formElements);
    })
};
exports.createForm = (ninds, org) => {
    return new Promise(async (resolve, reject) => {
        let designations = parseDesignations(ninds);
        let definitions = parseDefinitions(ninds);
        let sources = parseSources(ninds);
        let ids = parseIds(ninds);
        let properties = parseProperties(ninds);
        let referenceDocuments = parseReferenceDocuments(ninds);
        let classification = parseClassification(ninds);
        let formElements = await parseFormElements(ninds);

        let newForm = {
            tinyId: generateTinyId(),
            createdBy: {username: 'batchloader'},
            sources: sources,
            created: today,
            imported: today,
            isCopyrighted: ninds.copyright,
            noRenderAllowed: ninds.copyright,
            stewardOrg: {name: 'NINDS'},
            registrationState: {registrationStatus: "Qualified"},
            designations: designations,
            definitions: definitions,
            referenceDocuments: referenceDocuments,
            ids: ids,
            classification: classification,
            properties: properties,
            formElements: formElements
        };
        resolve(newForm);
    })
};