function resultInvalid(message) {
    return {
        allValid: false,
        message
    };
}

export const checkPvUnicity = function (valueDomain) {
    if (valueDomain.datatype === 'Value List' && valueDomain.permissibleValues.length === 0) {
        return resultInvalid('Value List must contain at least one Permissible Value');
    }
    let allPvs = {}, allCodes = {}, allVms = {};
    return valueDomain.permissibleValues.reduce((acc, pv) => {
        let pvCode = pv.valueMeaningCode ? pv.valueMeaningCode : '';
        let pvCodeSystem = pv.codeSystemName ? pv.codeSystemName : '';
        if (pvCode.length > 0 && pvCodeSystem.length === 0) {
            return resultInvalid(pv.notValid = 'pvCode is not empty, pvCodeSystem is empty');
        }
        if (allPvs[pv.permissibleValue]) {
            return resultInvalid(pv.notValid = 'Duplicate Permissible Value: ' + pv.permissibleValue);
        }
        if (allVms[pv.valueMeaningName]) {
            return resultInvalid(pv.notValid = 'Duplicate Code Name: ' + pv.valueMeaningName);
        }
        if (allCodes[pv.valueMeaningCode]) {
            return resultInvalid(pv.notValid = 'Duplicate Code: ' + pv.valueMeaningCode);
        }
        if (pv.permissibleValue) allPvs[pv.permissibleValue] = 1;
        if (pv.valueMeaningName && pv.valueMeaningName.length > 0 && pv.valueMeaningName.indexOf('Login to see the value') === -1)
            allVms[pv.valueMeaningName] = 1;
        if (pv.valueMeaningCode && pv.valueMeaningCode.length > 0 && pv.valueMeaningCode.indexOf('Login to see the value') === -1)
            allCodes[pv.valueMeaningCode] = 1;
        delete pv.notValid;
        return acc;
    }, {allValid: true});
};

export const checkDefinitions = function (elt) {
    let result = {allValid: true};
    elt.definitions.forEach(def => {
        if (!def.definition || !def.definition.length) {
            result = resultInvalid('Definition may not be empty.');
        }
    });
    return result;
};

export const fixDatatype = function (elt) {
    if (!elt.valueDomain) elt.valueDomain = {};
    if (!elt.valueDomain.datatype) {
        elt.valueDomain.datatype = 'Text';
    }
    if (elt.valueDomain.datatype === 'Value List' && !elt.valueDomain.datatypeValueList) {
        elt.valueDomain.datatypeValueList = {};
    }
    if (elt.valueDomain.datatype === 'Number' && !elt.valueDomain.datatypeNumber) {
        elt.valueDomain.datatypeNumber = {};
    }
    if (elt.valueDomain.datatype === 'Text' && !elt.valueDomain.datatypeText) {
        elt.valueDomain.datatypeText = {};
    }
    if (elt.valueDomain.datatype === 'Date' && !elt.valueDomain.datatypeDate) {
        elt.valueDomain.datatypeDate = {};
    }
    if (elt.valueDomain.datatype === 'Dynamic Code List' && !elt.valueDomain.datatypeDynamicCodeList) {
        elt.valueDomain.datatypeDynamicCodeList = {};
    }
    if (elt.valueDomain.datatype === 'Externally Defined' && !elt.valueDomain.datatypeExternallyDefined) {
        elt.valueDomain.datatypeExternallyDefined = {};
    }
};

export const wipeDatatype = function (elt) {
    if (elt.elementType !== 'cde') return;
    fixDatatype(elt);
    let valueDomain = {
        name: elt.valueDomain.name,
        ids: elt.valueDomain.ids,
        identifiers: elt.valueDomain.identifiers,
        definition: elt.valueDomain.definition,
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
};
