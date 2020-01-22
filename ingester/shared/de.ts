import { isEmpty } from 'lodash';
import {
    fixClassification, fixCreated, fixCreatedBy, fixEmptyDesignation, fixSources,
} from 'ingester/shared/utility';

export function fixValueDomain(cdeObj) {
    if (!cdeObj.valueDomain.permissibleValues) {
        cdeObj.valueDomain.permissibleValues = [];
    }
    if (!cdeObj.valueDomain.datatype) {
        cdeObj.valueDomain.datatype = 'Text';
    }
    const datatype = cdeObj.valueDomain.datatype;
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

    if (datatype === 'Value List') {
        if (isEmpty(cdeObj.valueDomain.permissibleValues)) {
            cdeObj.valueDomain.permissibleValues = [{permissibleValue: '5'}];
        }
        cdeObj.valueDomain.permissibleValues = fixEmptyPermissibleValue(cdeObj.valueDomain.permissibleValues);
    } else {
        cdeObj.valueDomain.permissibleValues = [];
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
    }
    myProps.filter(e => e !== checkType).forEach(p => {
        delete cdeObj.valueDomain[p];
    });
    if (!cdeObj.valueDomain[checkType]) {
        cdeObj.valueDomain[checkType] = {};
    }

    return cdeObj.valueDomain;
}

export function fixDatatypeNumber(datatypeNumber) {
    const minValueString = datatypeNumber.minValue;

    const minValue = parseInt(minValueString, 10);
    const maxValueString = datatypeNumber.maxValue;
    const maxValue = parseInt(maxValueString, 10);
    const result: any = {};
    if (!isNaN(minValue)) {
        result.minValue = minValue;
    }
    if (!isNaN(maxValue)) {
        result.maxValue = maxValue;
    }
    return result;
}

export function fixDatatypeText(datatypeText) {
    const minLengthString = datatypeText.minLength;

    const minLength = parseInt(minLengthString, 10);
    const maxLengthString = datatypeText.maxLength;
    const maxLength = parseInt(maxLengthString, 10);
    const result: any = {};
    if (!isNaN(minLength)) {
        result.minLength = minLength;
    }
    if (!isNaN(maxLength)) {
        result.maxLength = maxLength;
    }
    return result;
}

export function fixEmptyPermissibleValue(permissibleValues) {
    const result = [];
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

export function fixDerivationRules(cdeObj) {
    const derivationRules = [];
    cdeObj.derivationRules.forEach(d => {
        if (!isEmpty(d.inputs)) {
            const inputs: string[] = [];
            d.inputs.forEach(input => {
                const underScoreTinyId = input.replace(/-/g, '_');
                inputs.push(underScoreTinyId);
            });
            d.inputs = inputs;
        }
        derivationRules.push(d);
    });
    return derivationRules;
}

export function fixCdeError(cde) {
    const cdeObj = cde.toObject();

    if (!cde.createdBy) {
        fixCreatedBy(cde);
    }
    if (!cde.created) {
        fixCreated(cde);
    }
    cde.valueDomain = fixValueDomain(cdeObj);
    cde.designations = fixEmptyDesignation(cdeObj);
    cde.sources = fixSources(cdeObj);
    cde.derivationRules = fixDerivationRules(cdeObj);
    cde.classification = fixClassification(cdeObj);
}
