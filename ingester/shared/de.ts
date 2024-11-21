import {isEmpty} from 'lodash';
import {fixClassification, fixCreated, fixCreatedBy, fixEmptyDesignation, fixSources,} from 'ingester/shared/utility';

export function fixValueDomain(cdeObj) {
    const valueDomain: any = {
        datatype: 'Text',
        ids: [],
        identifiers: [],
        permissibleValues: []
    };
    if (!isEmpty(cdeObj.valueDomain.datatype)) {
        valueDomain.datatype = cdeObj.valueDomain.datatype;
    }
    if (!isEmpty(cdeObj.valueDomain.name)) {
        valueDomain.name = cdeObj.valueDomain.name;
    }
    if (!isEmpty(cdeObj.valueDomain.identifiers)) {
        valueDomain.identifiers = cdeObj.valueDomain.identifiers;
    }
    if (!isEmpty(cdeObj.valueDomain.ids)) {
        valueDomain.ids = cdeObj.valueDomain.ids;
    }
    if (!isEmpty(cdeObj.valueDomain.definition)) {
        valueDomain.definition = cdeObj.valueDomain.definition;
    }
    if (!isEmpty(cdeObj.valueDomain.uom)) {
        valueDomain.uom = cdeObj.valueDomain.uom;
    }
    if (!isEmpty(cdeObj.valueDomain.uom)) {
        valueDomain.vsacOid = cdeObj.valueDomain.vsacOid;
    }
    const datatype = valueDomain.datatype;
    if (datatype === 'Value List') {
        valueDomain.permissibleValues = fixPermissibleValue(cdeObj.valueDomain.permissibleValues);
        if (isEmpty(valueDomain.permissibleValues)) {
            valueDomain.datatype = 'Text';
        }
    } else {
        if (datatype === 'Text') {
            if (!isEmpty(cdeObj.valueDomain.datatypeText)) {
                valueDomain.datatypeText = fixDatatypeText(cdeObj.valueDomain.datatypeText);
            }
        }
        if (datatype === 'Number') {
            if (!isEmpty(cdeObj.valueDomain.datatypeNumber)) {
                valueDomain.datatypeNumber = fixDatatypeNumber(cdeObj.valueDomain.datatypeNumber);
            }
        }
        if (datatype === 'Date') {
            if (!isEmpty(cdeObj.valueDomain.datatypeDate)) {
                valueDomain.datatypeDate = fixDatatypeDate(cdeObj.valueDomain.datatypeDate);
            }
        }
        if (datatype === 'Time') {
            if (!isEmpty(cdeObj.valueDomain.datatypeTime)) {
                valueDomain.datatypeTime = fixDatatypeTime(cdeObj.valueDomain.datatypeTime);
            }
        }
        if (datatype === 'Dynamic List') {
            if (!isEmpty(cdeObj.valueDomain.datatypeDynamicList)) {
                valueDomain.datatypeDynamicList = fixDatatypeDynamicList(cdeObj.valueDomain.datatypeDynamicList);
            }
        }
        if (datatype === 'Externally Defined') {
            if (!isEmpty(cdeObj.valueDomain.datatypeExternallyDefined)) {
                valueDomain.datatypeExternallyDefined = fixDatatypeExternallyDefined(cdeObj.valueDomain.datatypeExternallyDefined);
            }
        }
    }

    return cdeObj.valueDomain = valueDomain;
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

export function fixDatatypeDate(datatypeDate) {
    return {
        precision: datatypeDate.precision
    };
}

export function fixDatatypeTime(datatypeTime) {
    return {
        format: datatypeTime.format
    };
}

export function fixDatatypeDynamicList(datatypeDynamicList) {
    const result: any = {};
    if (!isEmpty(datatypeDynamicList.system)) {
        result.system = datatypeDynamicList.system;
    }
    if (!isEmpty(datatypeDynamicList.code)) {
        result.code = datatypeDynamicList.code;
    }
    return result;
}

export function fixDatatypeExternallyDefined(datatypeExternallyDefined) {
    const result: any = {};
    if (!isEmpty(datatypeExternallyDefined.link)) {
        result.link = datatypeExternallyDefined.link;
    }
    if (!isEmpty(datatypeExternallyDefined.description)) {
        result.description = datatypeExternallyDefined.description;
    }
    if (!isEmpty(datatypeExternallyDefined.descriptionFormat)) {
        result.descriptionFormat = datatypeExternallyDefined.descriptionFormat;
    }
    return result;
}

export function fixPermissibleValue(permissibleValues) {
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

export function fixDeError(cde) {
    const cdeObj = cde.toObject();

    if (isEmpty(cdeObj.createdBy)) {
        fixCreatedBy(cde);
    }
    if (isEmpty(cdeObj.created)) {
        fixCreated(cde);
    }
    cde.valueDomain = fixValueDomain(cdeObj);
    cde.designations = fixEmptyDesignation(cdeObj);
    cde.sources = fixSources(cdeObj);
    cde.derivationRules = fixDerivationRules(cdeObj);
    cde.classification = fixClassification(cdeObj);
}
