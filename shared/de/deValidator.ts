import { Dictionary } from 'async';
import { DataElement, valueDomain, ValueDomain, ValueDomainValueList } from 'shared/de/dataElement.model';
import { Question } from 'shared/form/form.model';
import { copyValueDomain } from 'shared/datatype';

type ErrorMessage = {
    allValid: true
} | {
    allValid: false;
    message: string;
};

export function checkPvUnicity(valueDomain: ValueDomain): ErrorMessage {
    if (valueDomain.datatype !== 'Value List') {
        return {allValid: true};
    }
    if (valueDomain.datatype === 'Value List' && valueDomain.permissibleValues && valueDomain.permissibleValues.length === 0) {
        return resultInvalid('Value List must contain at least one Permissible Value');
    }
    const allCodes: Dictionary<number> = {};
    const allPvs: Dictionary<number> = {};
    const allVms: Dictionary<number> = {};
    return (valueDomain.permissibleValues || []).reduce<ErrorMessage>((acc, pv) => {
        const pvCode = pv.valueMeaningCode ? pv.valueMeaningCode : '';
        const pvCodeSystem = pv.codeSystemName ? pv.codeSystemName : '';
        if (pvCode.length > 0 && pvCodeSystem.length === 0) {
            return resultInvalid(pv.notValid = 'pvCode is not empty, pvCodeSystem is empty');
        }
        if (allPvs[pv.permissibleValue]) {
            return resultInvalid(pv.notValid = 'Duplicate Permissible Value: ' + pv.permissibleValue);
        }
        if (pv.valueMeaningName && allVms[pv.valueMeaningName]) {
            return resultInvalid(pv.notValid = 'Duplicate Code Name: ' + pv.valueMeaningName);
        }
        if (pv.valueMeaningCode && allCodes[pv.valueMeaningCode]) {
            return resultInvalid(pv.notValid = 'Duplicate Code: ' + pv.valueMeaningCode);
        }
        if (pv.permissibleValue) {
            allPvs[pv.permissibleValue] = 1;
        }
        if (pv.valueMeaningName && pv.valueMeaningName.length > 0 && pv.valueMeaningName.indexOf('Login to see the value') === -1) {
            allVms[pv.valueMeaningName] = 1;
        }
        if (pv.valueMeaningCode && pv.valueMeaningCode.length > 0 && pv.valueMeaningCode.indexOf('Login to see the value') === -1) {
            allCodes[pv.valueMeaningCode] = 1;
        }
        delete pv.notValid;
        return acc;
    }, {allValid: true});
}

export function checkDefinitions(elt: DataElement): ErrorMessage {
    let result: ErrorMessage = {allValid: true};
    elt.definitions.forEach(def => {
        if (!def.definition || !def.definition.length) {
            result = resultInvalid('Definition may not be empty.');
        }
    });
    return result;
}

export function fixDatatype(dc: Partial<Question | ValueDomain>): void {
    if (!dc.datatype) {
        dc.datatype = 'Text';
    }
    if (dc.datatype === 'Value List' && !dc.datatypeValueList) {
        dc.datatypeValueList = {};
        if (!(dc as ValueDomainValueList).permissibleValues) {
            (dc as ValueDomainValueList).permissibleValues = [];
        }
    }
    if (dc.datatype === 'Number' && !dc.datatypeNumber) {
        dc.datatypeNumber = {};
    }
    if (dc.datatype === 'Text' && !dc.datatypeText) {
        dc.datatypeText = {};
    }
    if (dc.datatype === 'Date' && !dc.datatypeDate) {
        dc.datatypeDate = {};
    }
    if (dc.datatype === 'Dynamic Code List' && !dc.datatypeDynamicCodeList) {
        dc.datatypeDynamicCodeList = {};
    }
    if (dc.datatype === 'Externally Defined' && !dc.datatypeExternallyDefined) {
        dc.datatypeExternallyDefined = {};
    }
}

export function fixDataElement(elt: DataElement): void {
    if (!elt.valueDomain) {
        elt.valueDomain = valueDomain() as ValueDomain;
    }
    fixDatatype(elt.valueDomain);
}

export function wipeDatatype(elt: DataElement): void {
    if (elt.elementType !== 'cde') {
        return;
    }
    fixDataElement(elt);
    const valueDomain: Partial<ValueDomain> = {
        definition: elt.valueDomain.definition,
        identifiers: elt.valueDomain.identifiers,
        ids: elt.valueDomain.ids,
        uom: elt.valueDomain.uom,
        vsacOid: elt.valueDomain.vsacOid
    };
    elt.valueDomain = copyValueDomain(elt.valueDomain, valueDomain) as ValueDomain;
}

function resultInvalid(message: string): ErrorMessage {
    return {
        allValid: false,
        message
    };
}
