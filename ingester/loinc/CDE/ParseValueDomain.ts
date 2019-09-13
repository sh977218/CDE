import { isEmpty } from 'lodash';

export function parseValueDomain(loinc) {
    const valueDomain: any = {
        datatype: 'Text',
        uom: '',
        permissibleValues: []
    };
    const loincAnswerList = loinc['Normative Answer List'] || loinc['Example Answer List'];
    if (isEmpty(loincAnswerList)) {

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
