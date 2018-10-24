const _ = require('lodash');

const DATA_TYPE_MAP = require('./DATA_TYPE_MAP').map;

const parsePermissibleValues = require('./ParsePermissibleValues').parsePermissibleValues;

exports.parseValueDomain = nindsForms => {
    let measurementTypeArray = [];
    let inputRestrictionsTypeArray = [];
    let dataTypeTypeArray = [];
    let sizeArray = [];
    let minValueArray = [];
    let maxValueArray = [];
    let permissibleValuesArray = [];
    let permissibleDescriptionArray = [];
    nindsForms.forEach(nindsForm => {
        nindsForm.cdes.forEach(nindsCde => {
            if (nindsCde.measurementType)
                measurementTypeArray.push(nindsCde.measurementType);
            if (nindsCde.inputRestrictions)
                inputRestrictionsTypeArray.push(nindsCde.inputRestrictions);
            if (nindsCde.dataType)
                dataTypeTypeArray.push(nindsCde.dataType);
            if (nindsCde.size)
                sizeArray.push(nindsCde.size);
            if (nindsCde.minValue)
                minValueArray.push(nindsCde.minValue);
            if (nindsCde.maxValue)
                maxValueArray.push(nindsCde.maxValue);
            if (nindsCde.permissibleValue)
                permissibleValuesArray.push(nindsCde.permissibleValue);
            if (nindsCde.permissibleDescription)
                permissibleDescriptionArray.push(nindsCde.permissibleDescription);
        })
    });

    let _measurementTypeArray = _.uniq(measurementTypeArray);
    let _inputRestrictionsTypeArray = _.uniq(inputRestrictionsTypeArray);
    let _dataTypeTypeArray = _.uniq(dataTypeTypeArray);
    let _sizeArray = _.uniq(sizeArray);
    let _minValueArray = _.uniq(minValueArray);
    let _maxValueArray = _.uniq(maxValueArray);
    let _permissibleValuesArray = _.uniq(permissibleValuesArray);
    let _permissibleDescriptionArray = _.uniq(permissibleDescriptionArray);

    let valueDomain = {};

    if (_measurementTypeArray.length > 1) {
        console.log('_measurementTypeArray > 1');
        process.exit(1);
    }
    if (_inputRestrictionsTypeArray.length !== 1) {
        console.log('_inputRestrictionsTypeArray not 1');
        process.exit(1);
    }
    if (_dataTypeTypeArray.length !== 1) {
        console.log('_dataTypeTypeArray not 1');
        process.exit(1);
    }
    _measurementTypeArray.forEach(m => {
        if (m) valueDomain.uom = m;
    });
    _inputRestrictionsTypeArray.forEach(inputRestrictions => {
        if (inputRestrictions === 'Free-Form Entry') {
            let datatype = DATA_TYPE_MAP[_dataTypeTypeArray[0]];
            if (!datatype) {
                console.log(' unknown dataType found:' + datatype);
                process.exit(1);
            }
            if (datatype === 'Text') {
                if (_sizeArray.length !== 1) {
                    console.log('_sizeArray not 1');
                    process.exit(1);
                }
                valueDomain.datatypeText = {maxLength: Number(_sizeArray[0])};
            }
            if (valueDomain.datatype === 'Number') {
                if (_minValueArray.length !== 1) {
                    console.log('_minValueArray not 1');
                    process.exit(1);
                }
                if (_maxValueArray.length !== 1) {
                    console.log('_maxValueArray not 1');
                    process.exit(1);
                }
                valueDomain.datatypeNumber = {};
                valueDomain.datatypeNumber.minValue = Number(_minValueArray[0]);
                valueDomain.datatypeNumber.maxValue = Number(_maxValueArray[0]);
            }
        } else if (['Single Pre-Defined Value Selected', 'Multiple Pre-Defined Values Selected'].indexOf(inputRestrictions) > -1) {
            valueDomain.datatype = 'Value List';
            let datatype = DATA_TYPE_MAP[_dataTypeTypeArray[0]];
            if (!datatype) {
                console.log(' unknown dataType found:' + datatype);
                process.exit(1);
            }
            valueDomain.datatypeValueList = {datatype: datatype};
            if (_permissibleValuesArray.length === 0) {
                console.log('_permissibleValuesArray is 0');
                process.exit(1);
            }
            if (_permissibleDescriptionArray.length === 0) {
                console.log('_permissibleDescriptionArray is 0');
                process.exit(1);
            }
            valueDomain.permissibleValues = parsePermissibleValues(_permissibleValuesArray.join(';').toString(), _permissibleDescriptionArray.join(';').toString());
        } else {
            console.log(' unknown inputRestrictions found:' + inputRestrictions);
            process.exit(1);
        }
    });

    return valueDomain;
};