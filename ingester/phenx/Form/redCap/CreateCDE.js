const _ = require('lodash');
const generateTinyId = require('../../../../server/system/mongo-data').generateTinyId;

const classificationShared = require('@std/esm')(module)('../../../../shared/system/classificationShared');

const RED_CAP_DATA_TYPE_MAP = require('./REDCAP_DATATYPE_MAP').map;

parseDesignations = row => {
    let designations = [];

    let sectionHeader = row['Section Header'];
    let fieldLabel = row['Field Label'];
    let fieldLabelDesignation;
    let sectionHeaderDesignation;
    if (!_.isEmpty(fieldLabel.trim())) {
        fieldLabelDesignation = {
            designation: fieldLabel.trim(),
            source: 'PhenX',
            tags: []
        };
        designations.push(fieldLabelDesignation);
    }
    if (!_.isEmpty(sectionHeader.trim())) {
        sectionHeaderDesignation = {
            designation: sectionHeader.trim(),
            source: 'PhenX',
            tags: ['Question Text']
        };
        designations.push(sectionHeaderDesignation);
    }

    return designations;
};

parseValueDomain = row => {
    let valueDomain = {};

    let fieldNote = row['Field Note'].trim();
    let uomIndex = fieldNote.indexOf('| |');
    if (uomIndex !== -1) valueDomain.uom = fieldNote.substr(0, uomIndex).trim();

    let fieldType = row['Field Type'].trim();
    let validationType = row['Text Validation Type OR Show Slider Number'];
    let choicesCalculationsORSliderLabels = row['Choices, Calculations, OR Slider Labels'];
    if (validationType) validationType = validationType.trim();
    let datatype = RED_CAP_DATA_TYPE_MAP[fieldType];
    valueDomain.datatype = datatype;
    if (datatype === 'Date') {
        valueDomain.datatypeDate = {
            format: validationType.replace('date_', '')
        }
    } else if (datatype === 'Number') {
        valueDomain.datatypeNUmber = {
            precision: validationType === 'integer' ? 2 : 0
        };
        let textValidationMin = row['Text Validation Min'].trim();
        let textValidationMax = row['Text Validation Max'].trim();
        if (textValidationMin.length > 0) {
            valueDomain.datatypeNUmber.minValue = Number(textValidationMin);
        }
        if (textValidationMax.length > 0) {
            valueDomain.datatypeNUmber.maxValue = Number(textValidationMax);
        }
    } else if (datatype === 'Value List') {
        if (fieldType === 'yesno') {
            valueDomain.permissibleValues = [{
                permissibleValue: '1',
                valueMeaningName: 'Yes'
            }, {
                permissibleValue: '0',
                valueMeaningName: 'No'
            }];
        } else {
            if (!_.isEmpty(choicesCalculationsORSliderLabels)) {
                let permissibleValues = [];
                let pvArray = choicesCalculationsORSliderLabels.split('|');
                pvArray.forEach(pvText => {
                    if (pvText) {
                        let commaIndex = pvText.indexOf(',');
                        let permissibleValue = pvText.substr(0, commaIndex);
                        let valueMeaningName = pvText.substr(commaIndex + 1, pvText.length - 1);
                        permissibleValues.push({
                            permissibleValue: permissibleValue.trim(),
                            valueMeaningName: valueMeaningName.trim()
                        })
                    }
                });
                valueDomain.permissibleValues = permissibleValues;
            } else {
                valueDomain.datatype = 'Text';
            }
        }
    } else if (datatype === 'Text') {
        if (validationType.trim() === 'number') {
            valueDomain.datatype = 'Number';
        }

    } else if (datatype === 'File') {
    } else {
        throw 'Unknow datatype: ' + fieldType;
    }
    return valueDomain;
};

parseIds = (formId, row) => {
    let ids = [];
    let variableName = row['Variable / Field Name'];
    if (variableName) variableName = variableName.trim();
    if (variableName) {
        ids.push({
            source: 'PhenX Variable',
            id: formId + '_' + row['Variable / Field Name']
        })
    }

    return ids;
};
parseProperties = row => {
    let properties = [];
    let fieldNote = row['Field Note'];
    if (fieldNote) fieldNote = fieldNote.trim();
    if (fieldNote) {
        properties.push({
            source: 'PhenX',
            key: 'Field Note',
            value: fieldNote
        })
    }

    return properties;
};

exports.createCde = async (row, formId, protocol) => {
    let classificationArray = protocol['classification'];
    let designations = parseDesignations(row);
    let valueDomain = parseValueDomain(row);
    let ids = parseIds(formId, row);
    let properties = parseProperties(row);

    let newCde = {
        tinyId: generateTinyId(),
        designations: designations,
        stewardOrg: {name: 'PhenX'},
        sources: [{sourceName: 'PhenX'}],
        classification: [],
        valueDomain,
        registrationState: {registrationStatus: 'Candidate'},
        ids,
        properties,
        attachments: []
    };

    let classificationToAdd = ['REDCap'].concat(classificationArray);
    classificationShared.classifyItem(newCde, "PhenX", classificationToAdd);

    return newCde;
};