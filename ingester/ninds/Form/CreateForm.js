const _ = require('lodash');

const generateTinyId = require('../../../server/system/mongo-data').generateTinyId;
const DataElement = require('../../../server/cde/mongo-cde').DataElement;

const classificationShared = require('@std/esm')(module)('../../../shared/system/classificationShared');

const CreateCDE = require('../CDE/CreateCDE');
const today = new Date().toJSON();

parseDesignations = ninds => {
    let designations = [];
    ninds.crfModuleGuideline.forEach(c => {
        designations.push({
            designation: c.trim(),
            tags: []
        })
    });
    return designations;
};
parseDefinitions = ninds => {
    let definitions = [];
    ninds.description.forEach(c => {
        definitions.push({
            definition: c.trim(),
            tags: [],
        })
    });
    return definitions;
};
parseSources = ninds => {
    let sources = [];
    ninds.versionDate.forEach(v => {
        sources.push({
            sourceName: 'NINDS',
            updated: v
        })
    });
    return sources;
};
parseIds = ninds => {
    let ids = [{
        source: 'NINDS',
        id: ninds.formId[0],
        version: ninds.versionNum[0]
    }];
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
                console.log(cde.cdeId + ' existing cde ' + existingV + ' not match cde: ' + cde.versionNum);
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
                label: cde.questionText,
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
        let formElements = await parseFormElements(ninds);

        let newForm = {
            tinyId: generateTinyId(),
            createdBy: {username: 'batchloader'},
            updatedBy: {username: 'batchloader'},
            updated: today,
            sources: sources,
            created: today,
            imported: today,
            isCopyrighted: false,
            noRenderAllowed: false,
            stewardOrg: {name: 'NINDS'},
            registrationState: {registrationStatus: "Qualified"},
            designations: designations,
            definitions: definitions,
            referenceDocuments: referenceDocuments,
            ids: ids,
            classification: [],
            properties: properties,
            formElements: formElements
        };
        if (ninds.copyright[0]) {
            newForm.noRenderAllowed = true;
            newForm.isCopyrighted = true;
        }

        ninds.classification.forEach(c => {
            let diseaseToAdd = ['Disease', c.disease];
            let subDomainToAdd = ['Disease', c.disease];
            let classificationToAdd = ['Disease', c.disease];

            if (c.disease === 'Traumatic Brain Injury') {
                diseaseToAdd.push(c.subDisease);
                classificationToAdd.push(c.subDisease);
                subDomainToAdd.push(c.subDisease);
            }


            if (c.classification) {
                classificationToAdd.push('Classification');
                classificationToAdd.push(c.classification);
            }

            if (c.domain) {
                diseaseToAdd.push('Domain');
                subDomainToAdd.push('Domain');
                diseaseToAdd.push([c.domain, c.subDomain]);
                subDomainToAdd.push([c.domain, c.subDomain]);
                if (c.subDomain) {
                    diseaseToAdd.push(c.subDomain);
                    subDomainToAdd.push(c.subDomain);
                }
            }

            classificationShared.classifyItem(newForm, "NINDS", diseaseToAdd);
            classificationShared.classifyItem(newForm, "NINDS", subDomainToAdd);
            classificationShared.classifyItem(newForm, "NINDS", classificationToAdd);
            let domainToAdd = ['Domain', c.domain, c.subDomain];
            classificationShared.classifyItem(newForm, "NINDS", domainToAdd);
        });


        resolve(newForm);
    })
};