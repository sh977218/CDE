export const checkPvUnicity = function (valueDomain) {
    var result = {allValid: true};
    valueDomain.allValid = true;
    if (valueDomain.datatype === 'Value List' && valueDomain.permissibleValues.length === 0) {
        result.pvNotValidMsg = "permissibleValues is empty";
        result.allValid = false;
        valueDomain.pvNotValidMsg = "permissibleValues is empty";
        valueDomain.allValid = false;
        return;
    }
    var allPvs = {}, allCodes = {}, allVms = {};
    valueDomain.permissibleValues.forEach(function (pv) {
        var pvCode = pv.valueMeaningCode ? pv.valueMeaningCode : '';
        var pvCodeSystem = pv.codeSystemName ? pv.codeSystemName : '';
        if (pvCode.length > 0 && pvCodeSystem.length === 0) {
            pv.notValid = "pvCode is not empty, pvCodeSystem is empty";
            result.pvNotValidMsg = pv.notValid;
            result.allValid = false;
            valueDomain.pvNotValidMsg = pv.notValid;
            valueDomain.allValid = false;
            return;
        }
        if (allPvs[pv.permissibleValue]) {
            pv.notValid = "Duplicate Permissible Value";
            result.pvNotValidMsg = pv.notValid;
            result.allValid = false;
            valueDomain.pvNotValidMsg = pv.notValid;
            valueDomain.allValid = false;
            return;
        }
        if (allVms[pv.valueMeaningName]) {
            pv.notValid = "Duplicate Code Name";
            result.pvNotValidMsg = pv.notValid;
            result.allValid = false;
            valueDomain.pvNotValidMsg = pv.notValid;
            valueDomain.allValid = false;
            return;
        }
        if (allCodes[pv.valueMeaningCode]) {
            pv.notValid = "Duplicate Code";
            result.pvNotValidMsg = pv.notValid;
            result.allValid = false;
            valueDomain.pvNotValidMsg = pv.notValid;
            valueDomain.allValid = false;
            return;
        }
        allPvs[pv.permissibleValue] = 1;
        if (pv.valueMeaningName && pv.valueMeaningName.length > 0)
            allVms[pv.valueMeaningName] = 1;
        if (pv.valueMeaningCode && pv.valueMeaningCode.length > 0)
            allCodes[pv.valueMeaningCode] = 1;
        delete pv.notValid;
    });
    return result;
};

export const fixDatatype = function (elt) {
    if (!elt.valueDomain.datatype) {
        elt.valueDomain.datatype = "Text";
    }
    if (elt.valueDomain.datatype === "Value List" && !elt.valueDomain.datatypeValueList) {
        elt.valueDomain.datatypeValueList = {};
    }
    if (elt.valueDomain.datatype === "Number" && !elt.valueDomain.datatypeNumber) {
        elt.valueDomain.datatypeNumber = {};
    }
    if (elt.valueDomain.datatype === "Text" && !elt.valueDomain.datatypeText) {
        elt.valueDomain.datatypeText = {};
    }
    if (elt.valueDomain.datatype === "Date" && !elt.valueDomain.datatypeDate) {
        elt.valueDomain.datatypeDate = {};
    }
    if (elt.valueDomain.datatype === "Externally Defined" && !elt.valueDomain.datatypeExternallyDefined) {
        elt.valueDomain.datatypeExternallyDefined = {};
    }
};

export const wipeDatatype = function (elt) {
    if (elt.elementType !== "cde") return;
    fixDatatype(elt);
    var valueDomain = {
        name: elt.valueDomain.name,
        ids: elt.valueDomain.ids,
        identifiers: elt.valueDomain.identifiers,
        definition: elt.valueDomain.definition,
        uom: elt.valueDomain.uom,
        vsacOid: elt.valueDomain.vsacOid
    };
    if (elt.valueDomain.datatype === "Value List") {
        valueDomain.datatype = "Value List";
        valueDomain.permissibleValues = elt.valueDomain.permissibleValues;
        valueDomain.datatypeValueList = elt.valueDomain.datatypeValueList;
    } else if (elt.valueDomain.datatype === "Number") {
        valueDomain.datatype = "Number";
        valueDomain.datatypeNumber = elt.valueDomain.datatypeNumber;
    } else if (elt.valueDomain.datatype === "Text") {
        valueDomain.datatype = "Text";
        valueDomain.datatypeText = elt.valueDomain.datatypeText;
    } else if (elt.valueDomain.datatype === "Date") {
        valueDomain.datatype = "Date";
        valueDomain.datatypeDate = elt.valueDomain.datatypeDate;
    } else if (elt.valueDomain.datatype === "Externally Defined") {
        valueDomain.datatype = "Externally Defined";
        valueDomain.datatypeExternallyDefined = elt.valueDomain.datatypeExternallyDefined;
    } else {
        valueDomain.datatype = elt.valueDomain.datatype;
    }
    elt.valueDomain = valueDomain;
};