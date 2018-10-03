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
            tags: ['Health']
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
            tags: ['Health']
        })
    });
    return definitions;
};
parseSources = ninds => {
    let sources = [{
        sourceName: 'NINDS',
        updated: ninds.versionDate,
        datatype: ninds.dataType
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
parseProperties = ninds => {
    let properties = [];
    ninds.previousTitle.forEach(p => {
        properties.push({
            key: 'NINDS Previous Title',
            value: p,
            source: 'NINDS'
        });
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
        if (!_.isEmpty(r) && r !== 'No references available') {
            let refWords = _.words(r, /[^\s]+/g);
            let referenceDocument = {
                document: refWords.join(" "),
                source: 'NINDS'
            };
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
            console.log(ninds.cdeId[0] + ' unknown dataType found:' + ninds.dataType[0]);
            process.exit(1);
        }
        if (valueDomain.datatype === 'Text') {
            if (ninds.size[0])
                valueDomain.datatypeText = {maxLength: Number(ninds.size[0])};
        }
        if (valueDomain.datatype === 'Number') {
            valueDomain.datatypeNumber = {};
            if (ninds.minValue[0])
                valueDomain.datatypeNumber.minValue = Number(ninds.minValue[0]);
            if (ninds.maxValue[0])
                valueDomain.datatypeNumber.maxValue = Number(ninds.maxValue[0]);
        }
    } else if (ninds.inputRestrictions[0] === 'Single Pre-Defined Value Selected' || ninds.inputRestrictions[0] === 'Multiple Pre-Defined Values Selected') {
        valueDomain.datatype = 'Value List';
        valueDomain.datatypeValueList = {datatype: DATA_TYPE_MAP[ninds.dataType[0]]};
        if (!valueDomain.datatypeValueList.datatype) {
            console.log(ninds.cdeId[0] + ' unknown dataType found:' + ninds.dataType[0]);
            process.exit(1);
        }
        valueDomain.permissibleValues = ninds.permissibleValues;
    } else {
        console.log(ninds.cdeId + ' unknown inputRestrictions found:' + ninds.inputRestrictions[0]);
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
        version: ninds.versionNum[0],
        designations: designations,
        definitions: definitions,
        referenceDocuments: referenceDocuments,
        ids: ids,
        properties: properties,
        valueDomain: valueDomain,
        classification: []
    };

    ninds.population.forEach(p => {
        if (p) {
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

        if (c.classification) {
            classificationToAdd.push('Classification');
            classificationToAdd.push(c.classification);
        }

        if (c.domain) {
            diseaseToAdd.push('Domain');
            subDomainToAdd.push('Domain');
            diseaseToAdd.push(c.domain);
            subDomainToAdd.push(c.domain);

            if (c.subDomain) {
                diseaseToAdd.push(c.subDomain);
                subDomainToAdd.push(c.subDomain);
            }
        }

        classificationShared.classifyItem(newCde, "NINDS", diseaseToAdd);
        classificationShared.classifyItem(newCde, "NINDS", subDomainToAdd);
        classificationShared.classifyItem(newCde, "NINDS", classificationToAdd);
        let domainToAdd = ['Domain', c.domain, c.subDomain];
        classificationShared.classifyItem(newCde, "NINDS", domainToAdd);
    });

    return newCde;
};
