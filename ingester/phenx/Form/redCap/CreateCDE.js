const capitalize = require('capitalize');

const generateTinyId = require('../../../../server/system/mongo-data').generateTinyId;

exports.createCde = async (row, formId, protocol) => {
    let classificationArray = protocol['classification'];
    let variableName = row['Variable / Field Name'];
    let fieldLabel = row['Field Label'];
    let cde = {
        tinyId: generateTinyId(),
        naming: [{designation: capitalize.words(variableName.replace(/_/g, ' '))}],
        stewardOrg: {name: 'PhenX'},
        sources: [{sourceName: 'PhenX'}],
        classification: [{
            stewardOrg: {name: 'PhenX'},
            elements: [{name: 'REDCap', elements: []}]
        }],
        registrationState: {registrationStatus: 'Qualified'},
        properties: [{source: 'PhenX', key: 'Field Note', value: row['Field Note']}],
        ids: [{source: 'PhenX Variable', id: formId + '_' + row['Variable / Field Name'].trim()}],
        valueDomain: {}
    };
    if (fieldLabel.length > 0)
        cde.naming.push({
            designation: fieldLabel,
            source: 'PhenX',
            tags: [{tag: 'Question Text'}]
        });
    let fieldType = row['Field Type'];
    let validationType = row['Text Validation Type OR Show Slider Number'];
    if (validationType.trim() === 'date_mdy') {
        cde.valueDomain.datatype = 'Date';
        cde.valueDomain.datatypeDate = {
            format: 'mdy'
        }
    }
    else if (validationType.trim() === 'date_dmy') {
        cde.valueDomain.datatype = 'Date';
        cde.valueDomain.datatypeDate = {
            format: 'dmy'
        }
    } else if (validationType.trim() === 'notes') {
        cde.valueDomain.datatype = 'text';
    } else if (validationType.trim() === 'file') {
        cde.valueDomain.datatype = 'File';
    } else if (validationType.trim() === 'time') {
        cde.valueDomain.datatype = 'Time';
        cde.valueDomain.datatypeTime = {}
    } else if (validationType.trim() === 'integer' || validationType.trim() === 'number') {
        cde.valueDomain.datatype = 'Number';
        cde.valueDomain.datatypeNUmber = {
            precision: validationType.trim() === 'integer' ? 2 : 0
        };
        let textValidationMin = row['Text Validation Min'].trim();
        let textValidationMax = row['Text Validation Max'].trim();
        if (textValidationMin.length > 0) {
            cde.valueDomain.datatypeNUmber.minValue = Number(textValidationMin);
        }
        if (textValidationMax.length > 0) {
            cde.valueDomain.datatypeNUmber.maxValue = Number(textValidationMax);
        }
    } else {
        if (fieldType === 'yesno') {
            cde.valueDomain.datatype = 'Value List';
            cde.valueDomain.permissibleValues = [{
                permissibleValue: '1',
                valueMeaningName: 'Yes'
            }, {
                permissibleValue: '0',
                valueMeaningName: 'No'
            }];
        } else if (fieldType === 'calc') {
        } else if (row['Choices, Calculations, OR Slider Labels'].length > 0) {
            let pvText = row['Choices, Calculations, OR Slider Labels'];
            if (pvText && pvText.length > 0) {
                let permissibleValues = [];
                let pvArray = pvText.split('|');
                pvArray.forEach((pvText) => {
                    let tempArray = pvText.toString().split(',');
                    permissibleValues.push({
                        permissibleValue: tempArray[0].trim(),
                        valueMeaningName: tempArray[1].trim()
                    })
                });
                cde.valueDomain.permissibleValues = permissibleValues;
                cde.valueDomain.datatype = 'Value List';
            }
        } else {
            cde.valueDomain.datatype = 'text';
        }
    }
    return cde;
};