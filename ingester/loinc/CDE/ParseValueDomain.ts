import { isEmpty } from 'lodash';
import { map } from 'ingester/loinc/Mapping/LOINC_UOM_DATATYPE_MAP';

export function parseValueDomain(loinc) {
    const valueDomain: any = {
        datatype: 'Text',
        uom: '',
        permissibleValues: []
    };
    const loincAnswerList = loinc['Normative Answer List'] || loinc['Example Answer List'];
    if (isEmpty(loincAnswerList)) {
        const exampleUnits = loinc['Example Units'];
        if (exampleUnits.length !== 1) {
            console.log(`${loinc['LOINC Code']} has wrong Example Units.`);
            process.exit(1);
        } else {
            const exampleUnit = exampleUnits[0];
            const unit = exampleUnit.Unit;
            const datatype = map[unit];
            if (isEmpty(datatype)) {
                console.log(`${loinc['LOINC Code']} uom ${unit} is not in LOINC_UOM_DATATYPE_MAP.`);
                process.exit(1);
            } else {
                valueDomain.datatype = datatype;
            }
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
