exports.checkPvUnicity = function (valueDomain) {
    var result = {allValid: true};
    if (valueDomain.datatype === 'Value List' && valueDomain.permissibleValues.length === 0) {
        result.pvNotValidMsg = "permissibleValues is empty";
        return result.allValid = false;
    }
    var allPvs = {}, allCodes = {}, allVms = {};
    valueDomain.permissibleValues.forEach(function (pv) {
        var pvCode = pv.valueMeaningCode ? pv.valueMeaningCode : '';
        var pvCodeSystem = pv.codeSystemName ? pv.codeSystemName : '';
        if (pvCode.length > 0 && pvCodeSystem.length === 0) {
            pv.notValid = "pvCode is not empty, pvCodeSystem is empty";
            result.pvNotValidMsg = pv.notValid;
            return result.allValid = false;
        }
        if (allPvs[pv.permissibleValue]) {
            pv.notValid = "Duplicate Permissible Value";
            result.pvNotValidMsg = pv.notValid;
            return result.allValid = false;
        }
        if (allVms[pv.valueMeaningName]) {
            pv.notValid = "Duplicate Code Name";
            result.pvNotValidMsg = pv.notValid;
            return result.allValid = false;
        }
        if (allCodes[pv.valueMeaningCode]) {
            pv.notValid = "Duplicate Code";
            result.pvNotValidMsg = pv.notValid;
            return result.allValid = false;
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

exports.fixDatatype = function (elt) {
    if (!elt.valueDomain.datatype) elt.valueDomain.datatype = "";
    if (elt.valueDomain.datatype.toLowerCase() === "value list" && !elt.valueDomain.datatypeValueList)
        elt.valueDomain.datatypeValueList = {};
    if (elt.valueDomain.datatype.toLowerCase() === "number" && !elt.valueDomain.datatypeNumber)
        elt.valueDomain.datatypeNumber = {};
    if (elt.valueDomain.datatype.toLowerCase() === "text" && !elt.valueDomain.datatypeText)
        elt.valueDomain.datatypeText = {};
    if (elt.valueDomain.datatype.toLowerCase() === "date" && !elt.valueDomain.datatypeDate)
        elt.valueDomain.datatypeDate = {};
    if (elt.valueDomain.datatype.toLowerCase() === "externally defined" && !elt.valueDomain.datatypeExternallyDefined)
        elt.valueDomain.datatypeExternallyDefined = {};
};

exports.wipeDatatype = function (elt) {
    exports.fixDatatype(elt);
    var valueDomain = {
        name: elt.valueDomain.name,
        ids: elt.valueDomain.ids,
        identifiers: elt.valueDomain.identifiers,
        definition: elt.valueDomain.definition,
        uom: elt.valueDomain.uom,
        vsacOid: elt.valueDomain.vsacOid
    };
    if (elt.valueDomain.datatype.toLowerCase() === "value list") {
        valueDomain.datatype = "Value List";
        valueDomain.permissibleValues = elt.valueDomain.permissibleValues;
        valueDomain.datatypeValueList = elt.valueDomain.datatypeValueList;
    }
    if (elt.valueDomain.datatype.toLowerCase() === "number") {
        valueDomain.datatype = "Number";
        valueDomain.datatypeNumber = elt.valueDomain.datatypeNumber;
    }
    if (elt.valueDomain.datatype.toLowerCase() === "text") {
        valueDomain.datatype = "Text";
        valueDomain.datatypeText = elt.valueDomain.datatypeText;
    }
    if (elt.valueDomain.datatype.toLowerCase() === "date") {
        valueDomain.datatype = "Date";
        valueDomain.datatypeDate = elt.valueDomain.datatypeDate;
    }
    if (elt.valueDomain.datatype.toLowerCase() === "externally defined") {
        valueDomain.datatype = "Externally Defined";
        valueDomain.datatypeExternallyDefined = elt.valueDomain.datatypeExternallyDefined;
    }
    elt.valueDomain = valueDomain;
};