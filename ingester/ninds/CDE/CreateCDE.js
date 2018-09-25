const _ = require('lodash');
const generateTinyId = require('../../../server/system/mongo-data').generateTinyId;

const classificationShared = require('@std/esm')(module)('../../../shared/system/classificationShared');

const newLine = '<br>';
const today = new Date().toJSON();

parseDesignations = cde => {
    let designations = [{
        designation: cde.cdeName,
        tags: []
    }];
    let questionText = cde.questionText;
    if (questionText) {
        let index = questionText.indexOf(':');
        if (index === questionText.length - 1)
            questionText = questionText.substr(0, index);
        questionText = _.trim(questionText);
    }
    if (questionText !== 'N/A')
        designations.push({
            designation: questionText,
            tags: ['Question Text']
        });
    return designations;
};
parseDefinitions = cde => {
    let definitions = [{
        definition: cde.definitionDescription,
        tags: []
    }];
    return definitions;
};
parseSources = cde => {
    let sources = [{
        sourceName: 'NINDS',
        updated: cde.versionDate,
        datatype: cde.dataType
    }];
    return sources;
};
parseIds = cde => {
    let ids = [{source: 'NINDS', id: cde.cdeId, version: cde.versionNum}];
    if (cde.cadsrId) ids.push({source: 'caDSR', id: cde.cadsrId});
    if (cde.variableName) ids.push({source: 'NINDS Variable Name', id: cde.variableName});
    return ids;
};
parseProperties = (cde, ninds) => {
    let properties = [];
    if (cde.previousTitle)
        properties.push({key: 'NINDS Previous Title', value: cde.previousTitle, source: 'NINDS'});
    if (cde.instruction)
        properties.push({
            key: 'NINDS Guidelines',
            value: ninds.formId + newLine + cde.instruction + newLine,
            valueFormat: 'html',
            source: 'NINDS'
        });
    if (cde.aliasesForVariableName && cde.aliasesForVariableName !== 'Aliases for variable name not defined')
        properties.push({
            key: 'Aliases for Variable Name',
            value: cde.aliasesForVariableName,
            source: 'NINDS'
        });
    return properties;
};
parseReferenceDocuments = cde => {
    let referenceDocuments = [];

    if (cde.reference) _.trim(cde.reference);
    if (cde.reference && cde.reference !== 'No references available') {
        if (cde.reference) {
            let refWords = _.words(cde.reference, /[^\s]+/g);
            let uriIndex = refWords.indexOf('http://www.');
            if (uriIndex === -1) uriIndex = refWords.indexOf('https://www.');
            let referenceDocument = {
                title: refWords.join(" "),
                source: 'NINDS'
            };
            if (uriIndex !== -1) referenceDocument.uri = refWords[uriIndex];
            referenceDocuments.push(referenceDocument);
        }
    }
    return referenceDocuments;
};

exports.parsePermissibleValues = cde => {
    let permissibleValues = [];
    let pvsArray = cde.permissibleValue.split(';');
    let isPvValueNumber = /^\d+$/.test(pvsArray[0]);
    let pdsArray = cde.permissibleDescription.split(';');
    if (pvsArray.length !== pdsArray.length) {
        console.log('***permissibleValue and permissibleDescription do not match.');
        console.log('***cde:' + cde.cdeId);
        process.exit(1);
    }
    for (let i = 0; i < pvsArray.length; i++) {
        if (pvsArray[i].length > 0) {
            let pv = {
                permissibleValue: pvsArray[i],
                valueMeaningDefinition: pdsArray[i]
            };
            if (isPvValueNumber) {
                pv.valueMeaningName = pdsArray[i];
            } else {
                pv.valueMeaningName = pvsArray[i];
            }
            permissibleValues.push(pv);
        }
    }

    return permissibleValues;
};

parseValueDomain = cde => {
    let valueDomain = {uom: cde.measurementType};

    let permissibleValues = exports.parsePermissibleValue(cde);

    if (cde.inputRestrictions === 'Free-Form Entry') {
        if (cde.dataType === 'Alphanumeric') {
            valueDomain.datatype = 'Text';
            valueDomain.datatypeText = {maxLength: Number(cde.size)};
        } else if (cde.dataType === 'Date or Date & Time') {
            valueDomain.datatype = 'Date';
        } else if (cde.dataType === 'Numeric Values' || cde.dataType === 'Numeric values') {
            valueDomain.datatype = 'Number';
            valueDomain.datatypeNumber = {
                minValue: Number(cde.minValue),
                maxValue: Number(cde.maxValue)
            };
        } else if (cde.dataType === 'File') {
            valueDomain.datatype = 'File';
        } else {
            console.log('unknown cde.dataType found:' + cde.dataType);
            console.log('*******************ninds:\n' + ninds);
            console.log('*******************cde:\n' + cde);
            process.exit(1);
        }

    } else if (cde.inputRestrictions === 'Single Pre-Defined Value Selected' || cde.inputRestrictions === 'Multiple Pre-Defined Values Selected') {
        if (cde.dataType === 'Numeric Values' || cde.dataType === 'Numeric values') {
            valueDomain.datatypeValueList = {datatype: 'Number'};
        }
        else if (cde.dataType === 'Alphanumeric') {
            valueDomain.datatypeValueList = {datatype: 'Text'};
        }
        else if (cde.dataType === 'Date or Date & Time') {
            valueDomain.datatypeValueList = {datatype: 'Date'};
        }
        else if (cde.dataType === 'File') {
            valueDomain.datatype = 'File';
        }
        else {
            console.log('unknown cde.dataType found:' + cde.dataType);
            console.log('*******************ninds:\n' + ninds);
            console.log('*******************cde:\n' + cde);
            process.exit(1);
        }
        valueDomain.permissibleValues = permissibleValues;
        valueDomain.datatype = 'Value List';
    } else {
        console.log('unknown cde.inputRestrictions found:' + cde.inputRestrictions);
        console.log('*******************ninds:\n' + ninds);
        console.log('*******************cde:\n' + cde);
        process.exit(1);
    }

    return valueDomain;
};
parseClassification = (cde, ninds, newCde, nindsOrg) => {

    let diseaseToAdd = [
        'Disease',
        ninds.diseaseName
    ];
    let subDomainToAdd = [
        'Disease',
        ninds.diseaseName
    ];

    let classificationToAdd = [
        'Disease',
        ninds.diseaseName
    ];

    if (ninds.diseaseName === 'Traumatic Brain Injury') {
        diseaseToAdd.push(ninds.subDiseaseName);
        classificationToAdd.push(ninds.subDiseaseName);
        subDomainToAdd.push(ninds.subDiseaseName);
    }

    classificationToAdd.push('Classification');
    classificationToAdd.push(cde.classification);

    diseaseToAdd.push('Domain');
    subDomainToAdd.push('Domain');

    diseaseToAdd.push(cde.domain);
    subDomainToAdd.push(cde.domain);

    diseaseToAdd.push(cde.subDomain);
    subDomainToAdd.push(cde.subDomain);

    classificationShared.classifyItem(newCde, "NINDS", diseaseToAdd);
    classificationShared.addCategory({elements: nindsOrg.classifications}, diseaseToAdd);

    classificationShared.classifyItem(newCde, "NINDS", subDomainToAdd);
    classificationShared.addCategory({elements: nindsOrg.classifications}, subDomainToAdd);

    classificationShared.classifyItem(newCde, "NINDS", classificationToAdd);
    classificationShared.addCategory({elements: nindsOrg.classifications}, classificationToAdd);

    let populationArray = cde.population.split(';');
    populationArray.forEach(function (p) {
        if (p.length > 0) {
            classificationShared.classifyItem(newCde, "NINDS", ['Population', p]);
            classificationShared.addCategory({elements: nindsOrg.classifications}, ['Population', p]);
        }
    });
    let domainToAdd = ['Domain', cde.domain, cde.subDomain];
    classificationShared.classifyItem(newCde, "NINDS", domainToAdd);
    classificationShared.addCategory({elements: nindsOrg.classifications}, domainToAdd);
};
exports.createCde = (cde, ninds, nindsOrg) => {
    let designations = parseDesignations(cde);
    let definitions = parseDefinitions(cde);
    let sources = parseSources(cde);
    let ids = parseIds(cde);
    let properties = parseProperties(cde, ninds);
    let referenceDocuments = parseReferenceDocuments(cde);
    let valueDomain = parseValueDomain(cde);
    let newCde = {
        tinyId: generateTinyId(),
        stewardOrg: {name: "NINDS"},
        createdBy: {username: 'batchloader'},
        created: today,
        imported: today,
        registrationState: {registrationStatus: "Qualified"},
        sources: sources,
        version: cde.versionNum,
        designations: designations,
        definitions: definitions,
        referenceDocuments: referenceDocuments,
        ids: ids,
        properties: properties,
        valueDomain: valueDomain,
        classification: []
    };
    parseClassification(cde, ninds, newCde, nindsOrg);

    return newCde;
};
