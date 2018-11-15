const _ = require('lodash');

exports.parsePermissibleValues = (permissibleValuesString, permissibleDescriptionString) => {
    let permissibleValues = [];

    let pvsArray = permissibleValuesString.split(';');
    let pdsArray = permissibleDescriptionString.split(';');

    let _pvsArray = _.uniq(pvsArray);
    let _pdsArray = _.uniq(pdsArray);

    let isPvValueNumber = /^\d+$/.test(_pvsArray[0]);

    if (_pvsArray.length !== _pdsArray.length) {
        throw '***permissibleValue and permissibleDescription do not match.';
    }
    _pvsArray.forEach((pvs, i) => {
        let pv = {
            permissibleValue: pvs
        };
        if (_pdsArray[i]) {
            pv.valueMeaningDefinition = _pdsArray[i]
        } else {
            pv.valueMeaningDefinition = pvs;
        }
        if (isPvValueNumber) {
            pv.valueMeaningName = _pdsArray[i];
        } else {
            pv.valueMeaningName = pvs;
        }
        permissibleValues.push(pv);
    });

    return permissibleValues;
};