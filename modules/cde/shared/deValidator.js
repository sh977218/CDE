deValidator = {};

deValidator.checkPvUnicity = function(valueDomain) {
    var result = {allValid: true};
    var allPvs = {}, allCodes = {}, allVms = {};
    valueDomain.permissibleValues.forEach(function (pv) {
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

exports.deValidator = deValidator;
