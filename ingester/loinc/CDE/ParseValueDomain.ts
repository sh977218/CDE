import { isEmpty } from 'lodash';
import { map } from 'ingester/loinc/Mapping/LOINC_UOM_DATATYPE_MAP';

export function parseValueDomain(loinc) {
    const valueDomain: any = {
        datatype: 'Text',
        uom: '',
        permissibleValues: []
    };
    const loincAnswerList = loinc['Normative Answer List'] || loinc['Example Answer List'] || loinc['Preferred Answer List'] || [];
    const loincAnswerListFilterEmpty = loincAnswerList.filter(l => {
        if (!isEmpty(l.Code) || !isEmpty(l.Answer) || !isEmpty(l['Answer ID'])) {
            return true;
        } else {
            return false;
        }
    });
    if (isEmpty(loincAnswerListFilterEmpty)) {
        const exampleUnits = loinc['Example Units'];
        if (exampleUnits && exampleUnits.length === 1) {
            const exampleUnit = exampleUnits[0];
            const unit = exampleUnit.Unit;
            const datatype = map[unit];
            if (isEmpty(datatype)) {
                console.log(`${loinc['LOINC Code']} uom ${unit} is not in LOINC_UOM_DATATYPE_MAP.`);
                valueDomain.datatype = 'Text';
            } else {
                valueDomain.datatype = datatype;
            }
        } else {
            console.log(`${loinc['LOINC Code']} has no or wrong Example Units.`);
        }

    } else {
        valueDomain.datatype = 'Value List';
        valueDomain.permissibleValues = loincAnswerList.map(a => {
            const pv: any = {};
            if (!isEmpty(a.Code)) {
                pv.permissibleValue = a.Code;
            } else {
                pv.permissibleValue = a.Answer;
            }
            if (!isEmpty(a['Answer ID'])) {
                pv.valueMeaningCode = a['Answer ID'];
            }
            pv.codeSystemName = 'LOINC';
            return pv;
        });
    }

    return valueDomain;
}
