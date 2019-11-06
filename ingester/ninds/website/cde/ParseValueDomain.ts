const _ = require('lodash');

const DATA_TYPE_MAP = require('./DATA_TYPE_MAP').map;

const parseAnswer = require('../form/ParseAnswers').parseAnswers;

exports.parseValueDomain = nindsForms => {
    let measurementTypeArray = [];
    let inputRestrictionsTypeArray = [];
    let dataTypeTypeArray = [];
    let sizeArray = [];
    let minValueArray = [];
    let maxValueArray = [];
    let permissibleValuesArray = [];

    nindsForms.forEach(nindsForm => {
        nindsForm.cdes.forEach(nindsCde => {
            if (nindsCde['Measurement Type'])
                measurementTypeArray.push(nindsCde['Measurement Type']);
            if (nindsCde['Input Restrictions'])
                inputRestrictionsTypeArray.push(nindsCde['Input Restrictions']);
            if (nindsCde['Data Type'])
                dataTypeTypeArray.push(nindsCde['Data Type']);
            if (nindsCde['Size'])
                sizeArray.push(nindsCde['Size']);
            if (nindsCde['Min Value'])
                minValueArray.push(nindsCde['Min Value']);
            if (nindsCde['Max Value'])
                maxValueArray.push(nindsCde['Max Value']);
            permissibleValuesArray = permissibleValuesArray.concat(parseAnswer(nindsCde));
        });
    });

    let _measurementTypeArray = _.uniq(measurementTypeArray);
    let _inputRestrictionsTypeArray = _.uniq(inputRestrictionsTypeArray);
    let _dataTypeTypeArray = _.uniq(dataTypeTypeArray);
    let _sizeArray = _.uniq(sizeArray);
    let _minValueArray = _.uniq(minValueArray);
    let _maxValueArray = _.uniq(maxValueArray);
    let _permissibleValuesArray = _.uniqWith(permissibleValuesArray, (a, b) => {
        let apv = a.permissibleValue;
        let bpv = b.permissibleValue;
        return apv && bpv && _.isEqual(apv, bpv);
    });

    let valueDomain = {
        uom: "",
        permissibleValues: []
    };

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
            valueDomain.datatype = datatype;
            if (!datatype) {
                console.log(' unknown dataType found:' + datatype);
                process.exit(1);
            }
            if (datatype === 'Text') {
                if (_sizeArray.length > 1) {
                    console.log('_sizeArray greater 1');
                    process.exit(1);
                }
                if (_sizeArray.length > 0)
                    valueDomain.datatypeText = {maxLength: Number(_sizeArray[0])};
            }
            if (valueDomain.datatype === 'Number') {
                if (_minValueArray.length > 1) {
                    console.log('_minValueArray greater 1');
                    process.exit(1);
                }
                if (_maxValueArray.length > 1) {
                    console.log('_maxValueArray greater 1');
                    process.exit(1);
                }
                valueDomain.datatypeNumber = {};
                if (_minValueArray.length > 0)
                    valueDomain.datatypeNumber.minValue = Number(_minValueArray[0]);
                if (_maxValueArray.length > 0)
                    valueDomain.datatypeNumber.maxValue = Number(_maxValueArray[0]);
            }
        } else if (['Single Pre-Defined Value Selected', 'Multiple Pre-Defined Values Selected'].indexOf(inputRestrictions) > -1) {
            valueDomain.datatype = 'Value List';
            let datatype = DATA_TYPE_MAP[_dataTypeTypeArray[0]];
            if (!datatype) {
                console.log('Unknown dataType found:' + datatype);
                process.exit(1);
            }
            valueDomain.datatypeValueList = {datatype: datatype};
            if (datatype === 'Value List') {
                if (_permissibleValuesArray.length === 0) {
                    console.log('_permissibleValuesArray is not 1');
                    process.exit(1);
                }
            }
            valueDomain.permissibleValues = _permissibleValuesArray;
        } else {
            console.log(' unknown inputRestrictions found:' + inputRestrictions);
            process.exit(1);
        }
    });

    return valueDomain;
};