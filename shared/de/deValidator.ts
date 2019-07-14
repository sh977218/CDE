import { Dictionary } from 'async';
import { DataElement, ValueDomain } from 'shared/de/dataElement.model';
import { Question } from 'shared/form/form.model';


type errorMessage = { allValid: boolean, message?: string };

export function checkPvUnicity(valueDomain: ValueDomain): errorMessage {
    if (valueDomain.datatype !== 'Value List') {
        return {allValid: true};
    }
    if (valueDomain.datatype === 'Value List' && valueDomain.permissibleValues && valueDomain.permissibleValues.length === 0) {
        return resultInvalid('Value List must contain at least one Permissible Value');
    }
    let allPvs: Dictionary<number> = {}, allCodes: Dictionary<number> = {}, allVms: Dictionary<number> = {};
    return (valueDomain.permissibleValues || []).reduce((acc, pv) => {
        let pvCode = pv.valueMeaningCode ? pv.valueMeaningCode : '';
        let pvCodeSystem = pv.codeSystemName ? pv.codeSystemName : '';
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
        if (pv.permissibleValue) allPvs[pv.permissibleValue] = 1;
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

export function checkDefinitions(elt: DataElement): errorMessage {
    let result = {allValid: true};
    elt.definitions.forEach(def => {
        if (!def.definition || !def.definition.length) {
            result = resultInvalid('Definition may not be empty.');
        }
    });
    return result;
}

export function fixDatatype(dc: Question | ValueDomain): void {
    if (!dc.datatype) {
        dc.datatype = 'Text';
    }
    if (dc.datatype === 'Value List' && !dc.datatypeValueList) {
        dc.datatypeValueList = {};
        if (!(dc as ValueDomain).permissibleValues) {
            (dc as ValueDomain).permissibleValues = [];
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
    if (!elt.valueDomain) elt.valueDomain = {datatype: 'Text', identifiers: [], ids: []};
    fixDatatype(elt.valueDomain);
}

export function wipeDatatype(elt: DataElement): void {
    if (elt.elementType !== 'cde') return;
    fixDataElement(elt);
    let valueDomain: ValueDomain = {
        datatype: 'Text',
        definition: elt.valueDomain.definition,
        identifiers: elt.valueDomain.identifiers,
        ids: elt.valueDomain.ids,
        uom: elt.valueDomain.uom,
        vsacOid: elt.valueDomain.vsacOid
    };
    if (elt.valueDomain.datatype === 'Value List') {
        valueDomain.datatype = 'Value List';
        valueDomain.permissibleValues = elt.valueDomain.permissibleValues;
        valueDomain.datatypeValueList = elt.valueDomain.datatypeValueList;
    } else if (elt.valueDomain.datatype === 'Number') {
        valueDomain.datatype = 'Number';
        valueDomain.datatypeNumber = elt.valueDomain.datatypeNumber;
    } else if (elt.valueDomain.datatype === 'Text') {
        valueDomain.datatype = 'Text';
        valueDomain.datatypeText = elt.valueDomain.datatypeText;
    } else if (elt.valueDomain.datatype === 'Date') {
        valueDomain.datatype = 'Date';
        valueDomain.datatypeDate = elt.valueDomain.datatypeDate;
    } else if (elt.valueDomain.datatype === 'Dynamic Code List') {
        valueDomain.datatype = 'Dynamic Code List';
        valueDomain.datatypeDynamicCodeList = elt.valueDomain.datatypeDynamicCodeList;
    } else if (elt.valueDomain.datatype === 'Externally Defined') {
        valueDomain.datatype = 'Externally Defined';
        valueDomain.datatypeExternallyDefined = elt.valueDomain.datatypeExternallyDefined;
    } else {
        valueDomain.datatype = elt.valueDomain.datatype;
    }
    elt.valueDomain = valueDomain;
}

function resultInvalid(message: string): errorMessage {
    return {
        allValid: false,
        message
    };
}

