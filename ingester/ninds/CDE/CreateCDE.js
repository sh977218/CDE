const _ = require('lodash');
const generateTinyId = require('../../../server/system/mongo-data').generateTinyId;

const classificationShared = require('@std/esm')(module)('../../../shared/system/classificationShared');
const DATA_TYPE_MAP = require('./DATA_TYPE_MAP').map;
const today = new Date().toJSON();

parseDesignations = ninds => {
    let designations = [];
    ninds.cdeName.forEach(n => {
        designations.push({
            designation: n,
            tags: []
        })
    });
    ninds.questionText.forEach(n => {
        if (n !== 'N/A')
            designations.push({
                designation: n,
                tags: ['Question Text']
            });
    });
    return designations;
};
parseDefinitions = ninds => {
    let definitions = [];
    ninds.definitionDescription.forEach(d => {
        definitions.push({
            definition: d,
            tags: []
        })
    });
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
parseIds = ninds => {
    let ids = [{source: 'NINDS', id: ninds.cdeId[0], version: ninds.versionNum[0]}];
    ninds.cadsrId.forEach(c => {
        ids.push({source: 'caDSR', id: c});
    });
    ninds.variableName.forEach(v => {
        ids.push({source: 'NINDS Variable Name', id: v});
    });
    return ids;
};
parseProperties = cde => {
    let properties = [];
    ninds.previousTitle.forEach(p => {
        properties.push({key: 'NINDS Previous Title', value: p, source: 'NINDS'});
    });
    ninds.instruction.forEach(i => {
        properties.push({
            key: 'NINDS Guidelines',
            value: i,
            valueFormat: 'html',
            source: 'NINDS'
        });
    });
    ninds.aliasesForVariableName.forEach(a => {
        if (a !== 'Aliases for variable name not defined')
            properties.push({
                key: 'Aliases for Variable Name',
                value: a,
                source: 'NINDS'
            });
    });
    return properties;
};
parseReferenceDocuments = ninds => {
    let referenceDocuments = [];
    ninds.reference.forEach(r => {
        if (r !== 'No references available') {
            let refWords = _.words(r, /[^\s]+/g);
            let uriIndex = refWords.indexOf('http://www.');
            if (uriIndex === -1) uriIndex = refWords.indexOf('https://www.');
            let referenceDocument = {
                title: refWords.join(" "),
                source: 'NINDS'
            };
            if (uriIndex !== -1) referenceDocument.uri = refWords[uriIndex];
            referenceDocuments.push(referenceDocument);
        }
    });
    return referenceDocuments;
};
exports.parsePermissibleValues = ninds => {
    let permissibleValues = [];
    let pvsArray = ninds.permissibleValue.split(';');
    let isPvValueNumber = /^\d+$/.test(pvsArray[0]);
    let pdsArray = ninds.permissibleDescription.split(';');
    if (pvsArray.length !== pdsArray.length) {
        console.log('***permissibleValue and permissibleDescription do not match.');
        console.log('***cde:' + ninds.cdeId);
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
parseValueDomain = ninds => {
    let valueDomain = {uom: ''};
    ninds.measurementType.forEach(m => {
        valueDomain.uom = m;
    });

    if (ninds.inputRestrictions[0] === 'Free-Form Entry') {
        valueDomain.datatype = DATA_TYPE_MAP[ninds.dataType[0]];
        if (!valueDomain.datatype) {
            console.log(ninds.cdeId + ' unknown dataType found:' + cde.dataType);
            process.exit(1);
        }
        if (valueDomain.dataType === 'Text') {
            valueDomain.datatypeText = {maxLength: Number(ninds.size)};
        }
        if (valueDomain.datatype === 'Number') {
            valueDomain.datatypeNumber = {
                minValue: Number(ninds.minValue),
                maxValue: Number(ninds.maxValue)
            };
        }
    } else if (ninds.inputRestrictions[0] === 'Single Pre-Defined Value Selected' || ninds.inputRestrictions[0] === 'Multiple Pre-Defined Values Selected') {
        valueDomain.datatype = 'Value List';
        valueDomain.datatypeValueList = {datatype: DATA_TYPE_MAP[ninds.dataType[0]]};
        if (!valueDomain.datatypeValueList.datatype) {
            console.log(ninds.cdeId + ' unknown dataType found:' + ninds.dataType);
            process.exit(1);
        }
        valueDomain.permissibleValues = ninds.parsePermissibleValues;
    } else {
        console.log(ninds.cdeId + ' unknown inputRestrictions found:' + ninds.inputRestrictions);
        process.exit(1);
    }

    return valueDomain;
};

exports.createCde = ninds => {
    let designations = parseDesignations(ninds);
    let definitions = parseDefinitions(ninds);
    let sources = parseSources(ninds);
    let ids = parseIds(ninds);
    let properties = parseProperties(ninds);
    let referenceDocuments = parseReferenceDocuments(ninds);
    let valueDomain = parseValueDomain(ninds);
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

    ninds.population.forEach(p => {
        if (p.length > 0) {
            classificationShared.classifyItem(newCde, "NINDS", ['Population', p]);
        }
    });

    ninds.classification.forEach(c => {
        let diseaseToAdd = ['Disease', c.disease];
        let subDomainToAdd = ['Disease', c.disease];
        let classificationToAdd = ['Disease', c.disease];

        if (c.disease === 'Traumatic Brain Injury') {
            diseaseToAdd.push(c.subDisease);
            classificationToAdd.push(c.subDisease);
            subDomainToAdd.push(c.subDisease);
        }

        classificationToAdd.push('Classification');
        classificationToAdd.push(c.classification);

        diseaseToAdd.push('Domain');
        subDomainToAdd.push('Domain');

        diseaseToAdd.concat([c.domain, c.subDomain]);
        subDomainToAdd.concat([c.domain, c.subDomain]);

        classificationShared.classifyItem(newCde, "NINDS", diseaseToAdd);
        classificationShared.classifyItem(newCde, "NINDS", subDomainToAdd);
        classificationShared.classifyItem(newCde, "NINDS", classificationToAdd);
        let domainToAdd = ['Domain', c.domain, c.subDomain];
        classificationShared.classifyItem(newCde, "NINDS", domainToAdd);
    });

    return newCde;
};
