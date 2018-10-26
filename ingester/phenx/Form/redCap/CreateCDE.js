const capitalize = require('capitalize');

const generateTinyId = require('../../../../server/system/mongo-data').generateTinyId;

parseDesignations = row => {
    let designations = [];

    let variableName = row['Variable / Field Name'];
    let fieldLabel = row['Field Label'];
    if (fieldLabel) {
        let designation = {
            designation: fieldLabel,
            source: 'PhenX',
            tags: []
        };
        if (fieldLabel === variableName) {
            designation.tags.push('Question Text');
        }
        designations.push(designation);
    }

    return designations;
};

let RED_CAP_DATA_TYPE_MAP = {
    'date_mdy': 'Date',
    'notes': 'Text',
    'file': 'File',
    'time': 'Time',
    'integer': 'Number',
    'yesno': 'Value List',
    '': '',
    '': '',

}

parseValueDomain = row => {
    let valueDomain = {};

    let fieldType = row['Field Type'];
    let validationType = row['Text Validation Type OR Show Slider Number'];
    if (validationType) validationType = validationType.trim();
    let datatype = RED_CAP_DATA_TYPE_MAP[validationType];
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
    } else {
        valueDomain.datatype = 'Value List';
        let choicesCalculationsORSliderLabels = row['Choices, Calculations, OR Slider Labels'];
        if (fieldType === 'yesno') {
            valueDomain.permissibleValues = [{
                permissibleValue: '1',
                valueMeaningName: 'Yes'
            }, {
                permissibleValue: '0',
                valueMeaningName: 'No'
            }];
        } else if (fieldType === 'calc') {
        } else if (choicesCalculationsORSliderLabels) {
            let permissibleValues = [];
            let pvArray = choicesCalculationsORSliderLabels.split('|');
            pvArray.forEach(pvText => {
                let tempArray = pvText.toString().split(',');
                permissibleValues.push({
                    permissibleValue: tempArray[0].trim(),
                    valueMeaningName: tempArray[1].trim()
                })
            });
            valueDomain.permissibleValues = permissibleValues;
        } else {
            valueDomain.datatype = 'text';
        }
    }
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

    let cde = {
        tinyId: generateTinyId(),
        designations: designations,
        stewardOrg: {name: 'PhenX'},
        sources: [{sourceName: 'PhenX'}],
        classification: [{
            stewardOrg: {name: 'PhenX'},
            elements: [{name: 'REDCap', elements: []}]
        }],
        valueDomain,
        registrationState: {registrationStatus: 'Qualified'},
        ids,
        properties,
        attachments: []
    };

    return cde;
};