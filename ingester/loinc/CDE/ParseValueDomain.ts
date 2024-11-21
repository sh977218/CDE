import {isEmpty} from 'lodash';
import {map} from 'ingester/loinc/Mapping/LOINC_UOM_DATATYPE_MAP';

export function parseValueDomain(loinc) {
    const valueDomain: any = {
        datatype: 'Text',
        uom: '',
        permissibleValues: []
    };
    const loincAnswerList = loinc['Normative Answer List'] || loinc['Example Answer List'] || loinc['Preferred Answer List'] || [];
    if (!Array.isArray(loincAnswerList)) {
        if (!isEmpty(loincAnswerList) && loincAnswerList['Externally Defined'] === 'Yes') {
            valueDomain.datatype = 'Externally Defined';
            valueDomain.datatypeExternallyDefined = {
                link: loincAnswerList['Link to External List']
            };
            return valueDomain;
        }
    }

    const loincAnswerListFilterEmpty = loincAnswerList.filter(l => {
        if (!isEmpty(l.Code) || !isEmpty(l.Answer) || !isEmpty(l['Answer ID'])) {
            return true;
        } else {
            return false;
        }
    });
    if (isEmpty(loincAnswerListFilterEmpty)) {
        const exampleUnits = loinc['Example Units'];
        if (isEmpty(exampleUnits)) {
            console.log(`${loinc['LOINC Code']} has no Example Units. Default data type as Text`);
        } else {
            if (exampleUnits.length !== 1) {
                console.log(`${loinc['LOINC Code']} has more than one Example Units. Parse data type from first one`);
            }
            const exampleUnit = exampleUnits[0];
            const unit = exampleUnit.Unit;
            const datatype = map[unit];
            if (isEmpty(datatype)) {
                console.log(`${loinc['LOINC Code']} uom ${unit} is not in LOINC_UOM_DATATYPE_MAP.`);
                valueDomain.datatype = 'Text';
            } else {
                valueDomain.datatype = datatype;
            }
        }

    } else {
        valueDomain.datatype = 'Value List';
        valueDomain.permissibleValues = loincAnswerList.map(loincAnswer => {
            const pv: any = {};
            if (!isEmpty(loincAnswer.Code)) {
                pv.permissibleValue = loincAnswer.Code;
            } else {
                pv.permissibleValue = loincAnswer.Answer;
            }
            if (!isEmpty(loincAnswer['Answer ID'])) {
                pv.valueMeaningCode = loincAnswer['Answer ID'];
            }
            if (!isEmpty(loincAnswer.Answer)) {
                pv.valueMeaningName = loincAnswer.Answer;
            }
            pv.codeSystemName = 'LOINC';
            if (isEmpty(loincAnswer.Answer)) {
                console.log(`${loinc['LOINC Code']} has empty answer.`);
            }
            return pv;
        });
    }

    return valueDomain;
}
