const _ = require('lodash');

exports.parsePermissibleValues = (permissibleValuesString, permissibleDescriptionString) => {
    let permissibleValues = [];

    let pvsArray = permissibleValuesString.split(';');
    let pdsArray = permissibleDescriptionString.split(';');

    let _pvsArray = _.uniq(pvsArray).filter(p => p);
    let _pdsArray = _.uniq(pdsArray).filter(p => p);

    let isPvValueNumber = /^\d+$/.test(_pvsArray[0]);

    if (_pvsArray.length !== _pdsArray.length) {
        console.log('***permissibleValue and permissibleDescription do not match.');
        process.exit(1);
    }
    _pvsArray.forEach((pvs, i) => {
        let pv = {
            permissibleValue: pvs,
            valueMeaningDefinition: _pdsArray[i]
        };
        if (isPvValueNumber) {
            pv.valueMeaningName = _pdsArray[i];
        } else {
            pv.valueMeaningName = pvs;
        }
        permissibleValues.push(pv);
    });

    return permissibleValues;
};