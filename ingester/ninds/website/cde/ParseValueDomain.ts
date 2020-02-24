import { uniq, uniqWith, isEqual, isEmpty } from 'lodash';
import { map as DATA_TYPE_MAP } from 'ingester/ninds/website/cde/DATA_TYPE_MAP';

export function parseAnswers(ninds: any) {
    if (isEmpty(ninds)) {
        console.log(`ninds is empty.`);
        process.exit(1);
    }
    if (isEmpty(ninds['Permissible Values']) || isEmpty(ninds.Description)) {
        return [];
    }
    const a = ninds['Permissible Values'];
    const b = ninds.Description;
    const pvsArray = a.split(';');
    const pdsArray = b.split(';');
    if (pvsArray.length !== pdsArray.length) {
        console.log(`${ninds.cdeId} permissibleValue and permissibleDescription do not match in ParseAnswer`);
        process.exit(1);
    }
    const answers = [];
    const isPvValueNumber = /^\d+$/.test(pvsArray[0]);
    for (let i = 0; i < pvsArray.length; i++) {
        if (pvsArray[i].length > 0) {
            const pv: any = {
                permissibleValue: pvsArray[i],
                valueMeaningDefinition: pdsArray[i]
            };
            if (isPvValueNumber) {
                pv.valueMeaningName = pdsArray[i];
            } else {
                pv.valueMeaningName = pvsArray[i];
            }
            answers.push(pv);
        }
    }
    return answers;
}

export function parseValueDomain(nindsForms: any[]) {
    const measurementTypeArray: string[] = [];
    const inputRestrictionsTypeArray: string[] = [];
    const dataTypeTypeArray: string[] = [];
    const sizeArray: string[] = [];
    const minValueArray: string[] = [];
    const maxValueArray: string[] = [];
    let permissibleValuesArray: any[] = [];

    nindsForms.forEach(nindsForm => {
        nindsForm.cdes.forEach((nindsCde: any) => {
            if (nindsCde['Measurement Type']) {
                measurementTypeArray.push(nindsCde['Measurement Type']);
            }
            if (nindsCde['Input Restrictions']) {
                inputRestrictionsTypeArray.push(nindsCde['Input Restrictions']);
            }
            if (nindsCde['Data Type']) {
                dataTypeTypeArray.push(nindsCde['Data Type']);
            }
            if (nindsCde.Size) {
                sizeArray.push(nindsCde.Size);
            }
            if (nindsCde['Min Value']) {
                minValueArray.push(nindsCde['Min Value']);
            }
            if (nindsCde['Max Value']) {
                maxValueArray.push(nindsCde['Max Value']);
            }
            permissibleValuesArray = permissibleValuesArray.concat(parseAnswers(nindsCde));
        });
    });

    const _measurementTypeArray = uniq(measurementTypeArray);
    const _inputRestrictionsTypeArray = uniq(inputRestrictionsTypeArray);
    const _dataTypeTypeArray = uniq(dataTypeTypeArray);
    const _sizeArray = uniq(sizeArray);
    const _minValueArray = uniq(minValueArray);
    const _maxValueArray = uniq(maxValueArray);

    const _permissibleValuesArray = uniqWith(permissibleValuesArray, (a, b) => {
        const apv = a.permissibleValue;
        const bpv = b.permissibleValue;
        return apv && bpv && isEqual(apv, bpv);
    });

    const valueDomain: any = {
        datatype: 'Text',
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


    if (_sizeArray.length > 1) {
        console.log('_sizeArray greater 1');
        process.exit(1);
    }
    if (_minValueArray.length > 1) {
        console.log('_minValueArray greater 1');
        process.exit(1);
    }
    if (_maxValueArray.length > 1) {
        console.log('_maxValueArray greater 1');
        process.exit(1);
    }

    if (_measurementTypeArray.length > 0) {
        valueDomain.uom = _measurementTypeArray[0];
    }

    const inputRestrictions = _inputRestrictionsTypeArray[0];

    if (inputRestrictions === 'Free-Form Entry') {
        const datatype = DATA_TYPE_MAP[_dataTypeTypeArray[0]];
        valueDomain.datatype = datatype;
        if (!datatype) {
            console.log(' unknown dataType found:' + datatype);
            process.exit(1);
        }
        if (datatype === 'Text') {
            const datatypeText: any = {};
            if (_sizeArray.length > 0) {
                datatypeText.maxLength = Number(_sizeArray[0]);
            }
            if (!isEmpty(datatypeText)) {
                valueDomain.datatypeText = datatypeText;
            }
        }
        if (valueDomain.datatype === 'Number') {
            const datatypeNumber: any = {};
            if (_minValueArray.length > 0) {
                datatypeNumber.minValue = Number(_minValueArray[0]);
            }
            if (_maxValueArray.length > 0) {
                datatypeNumber.maxValue = Number(_maxValueArray[0]);
            }
            if (!isEmpty(datatypeNumber)) {
                valueDomain.datatypeNumber = datatypeNumber;
            }
        }
    } else if (['Single Pre-Defined Value Selected', 'Multiple Pre-Defined Values Selected'].indexOf(inputRestrictions) > -1) {
        valueDomain.datatype = 'Value List';
        valueDomain.permissibleValues = _permissibleValuesArray;
        if (_permissibleValuesArray.length === 0) {
            valueDomain.datatype = 'Text';
        }
    } else {
        console.log('Unknown inputRestrictions found:' + inputRestrictions);
        process.exit(1);
    }

    return valueDomain;
}
