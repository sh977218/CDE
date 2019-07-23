import { isEmpty, uniqBy } from 'lodash';

export function fixValueDomain(cdeObj) {
    if (!cdeObj.valueDomain.permissibleValues) {
        cdeObj.valueDomain.permissibleValues = [];
    }
    if (!cdeObj.valueDomain.datatype) {
        cdeObj.valueDomain.datatype = 'Text';
    }
    let datatype = cdeObj.valueDomain.datatype;
    const myProps = [
        'datatypeText',
        'datatypeNumber',
        'datatypeDate',
        'datatypeTime',
        'datatypeExternallyDefined',
        'datatypeValueList',
        'datatypeDynamicCodeList'
    ];
    let checkType = datatype.replace(/\s+/g, ' ');
    checkType = `datatype${checkType}`;

    if (datatype === 'Text') {
        if (!isEmpty(cdeObj.valueDomain.datatypeText)) {
            cdeObj.valueDomain.datatypeText = fixDatatypeText(cdeObj.valueDomain.datatypeText);
        }
    }
    if (datatype === 'Number') {
        if (!isEmpty(cdeObj.valueDomain.datatypeNumber)) {
            cdeObj.valueDomain.datatypeNumber = fixDatatypeNumber(cdeObj.valueDomain.datatypeNumber);
        }
    }
    if (datatype === 'Value List') {
        if (!cdeObj.valueDomain.permissibleValues) {
            cdeObj.valueDomain.permissibleValues = [{permissibleValue: '5'}];
        }
        cdeObj.valueDomain.permissibleValues = fixEmptyPermissibleValue(cdeObj.valueDomain.permissibleValues);
    }
    myProps.filter(e => e !== checkType).forEach(p => {
        delete cdeObj.valueDomain[p];
    });
    if (!cdeObj.valueDomain[checkType]) cdeObj.valueDomain[checkType] = {};

    return cdeObj.valueDomain;
}

export function fixDatatypeNumber(datatypeNumber) {
    let minValueString = datatypeNumber.minValue;
    let minValue = parseInt(minValueString);
    let maxValueString = datatypeNumber.maxValue;
    let maxValue = parseInt(maxValueString);
    let result: any = {};
    if (!isNaN(minValue)) {
        result.minValue = minValue;
    }
    if (!isNaN(maxValue)) {
        result.maxValue = maxValue;
    }
    return result;
}

export function fixDatatypeText(datatypeText) {
    let minLengthString = datatypeText.minLength;
    let minLength = parseInt(minLengthString);
    let maxLengthString = datatypeText.maxLength;
    let maxLength = parseInt(maxLengthString);
    let result: any = {};
    if (!isNaN(minLength)) {
        result.minLength = minLength;
    }
    if (!isNaN(maxLength)) {
        result.maxLength = maxLength;
    }
    return result;
}

export function fixSourceName(cdeObj) {
    cdeObj.sources.forEach(s => {
        if (!s.sourceName) {
            if (cdeObj.stewardOrg.name === 'LOINC' && s.registrationStatus === 'Active') {
                s.sourceName = 'LOINC';
            }
        }
    });
    return cdeObj.sources;
}

export function fixCreated(cde) {
    let defaultDate = new Date();
    defaultDate.setFullYear(1969, 1, 1);
    cde.created = defaultDate;
}

export function fixCreatedBy(cde) {
    cde.createdBy = {
        username: 'nobody'
    };
}

export function fixEmptyDesignation(cde) {
    let cdeObj = cde.toObject();
    cde.designations = cdeObj.designations.filter(d => d.designation);
}

export function fixEmptyPermissibleValue(permissibleValues) {
    let result = [];
    permissibleValues.forEach(pv => {
        if (!pv.permissibleValue) {
            pv.permissibleValue = pv.valueMeaningName;
        }
        if (!pv.valueMeaningName) {
            pv.valueMeaningName = pv.permissibleValue;
        }
        result.push(pv);
    });
    return result.filter(pv => !isEmpty(pv.permissibleValue));
}

export function fixClassification(cdeObj) {
    return uniqBy(cdeObj.classification, 'stewardOrg.name');
}


export function fixCdeError(cde) {
    if (!cde.createdBy) {
        fixCreatedBy(cde);
    }
    if (!cde.created) {
        fixCreated(cde);
    }
    cde.valueDomain = fixValueDomain(cde.toObject());
    fixEmptyDesignation(cde);
    cde.sources = fixSourceName(cde.toObject());
    cde.classification = fixClassification(cde.toObject());
}