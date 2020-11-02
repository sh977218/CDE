import { isEmpty } from 'lodash';
import { QuestionTypeNumber, QuestionTypeText } from 'shared/de/dataElement.model';
import { PermissibleValue } from 'shared/models.model';

const datatypeMapping: any = {
    CHARACTER: 'Text',
    character: 'Text',
    'java.lang.String': 'Text',
    'java.lang.string': 'Text',
    ALPHANUMERIC: 'Text',
    alphanumberic: 'Text',
    varchar: 'Text',
    CLOB: 'Text',
    clob: 'Text',

    Integer: 'Number',
    integer: 'Number',
    NUMBER: 'Number',
    number: 'Number',

    TIME: 'Time',
    time: 'Time',
    'SAS Time': 'Time',
    'sas time': 'Time',

    DATE: 'Date',
    date: 'Date',
    'SAS Date': 'Date',
    'sas date': 'Date',
    'DATE/TIME': 'Date',
    'Date/Time': 'Date',
    'date/time': 'Date',
    DATETIME: 'Date',
    datetime: 'Date'
};

export function parseValueDomain(nciXmlCde: any) {
    const valueDomain: any = {
        datatype: 'Text',
        permissibleValues: []
    };
    const nciDataTypeString = nciXmlCde.VALUEDOMAIN[0].Datatype[0];
    const nciDataType = nciDataTypeString.trim().toLowerCase();
    const datatype = datatypeMapping[nciDataType];
    if (!datatype) {
        console.log('No Mapping in ParseValueDomain ' + nciDataType);
        process.exit(1);
    }

    if (nciXmlCde.VALUEDOMAIN[0].ValueDomainType[0] === 'Enumerated') {
        valueDomain.datatypeValueList = {datatype};
        valueDomain.datatype = 'Value List';
        if (nciXmlCde.VALUEDOMAIN[0].PermissibleValues[0].PermissibleValues_ITEM) {
            nciXmlCde.VALUEDOMAIN[0].PermissibleValues[0].PermissibleValues_ITEM.forEach((pv: any) => {
                const newPv: PermissibleValue = {
                    permissibleValue: pv.VALIDVALUE[0],
                    valueMeaningName: pv.VALUEMEANING[0],
                    valueMeaningDefinition: pv.MEANINGDESCRIPTION[0],
                    codeSystemName: pv.MEANINGCONCEPTORIGIN[0].split(',')[0]
                };
                if (!pv.MEANINGCONCEPTS[0].attribute) {
                    newPv.valueMeaningCode = pv.MEANINGCONCEPTS[0].replace(/,/g, ':');
                }
                valueDomain.permissibleValues.push(newPv);
            });
            valueDomain.permissibleValues.sort((a: any, b: any) => a.permissibleValue - b.permissibleValue
            );
        }
    } else {
        valueDomain.datatype = datatype;
        if (valueDomain.datatype === 'Number') {
            const datatypeNumber: QuestionTypeNumber = {};
            if (nciXmlCde.VALUEDOMAIN[0].MaximumValue[0].length > 0) {
                datatypeNumber.maxValue = nciXmlCde.VALUEDOMAIN[0].MaximumValue[0];
            }
            if (nciXmlCde.VALUEDOMAIN[0].MinimumValue[0].length > 0) {
                datatypeNumber.minValue = nciXmlCde.VALUEDOMAIN[0].MinimumValue[0];
            }
            if (nciXmlCde.VALUEDOMAIN[0].DecimalPlace[0].length > 0) {
                datatypeNumber.precision = nciXmlCde.VALUEDOMAIN[0].DecimalPlace[0];
            }
            if (!isEmpty(datatypeNumber)) {
                valueDomain.datatypeNumber = datatypeNumber;
            }
        }
        if (valueDomain.datatype === 'Text') {
            const datatypeText: QuestionTypeText = {};
            if (nciXmlCde.VALUEDOMAIN[0].MaximumLength[0].length > 0) {
                datatypeText.maxLength = nciXmlCde.VALUEDOMAIN[0].MaximumLength[0];
            }
            if (nciXmlCde.VALUEDOMAIN[0].MinimumLength[0].length > 0) {
                datatypeText.minLength = nciXmlCde.VALUEDOMAIN[0].MinimumLength[0];
            }
            if (!isEmpty(datatypeText)) {
                valueDomain.datatypeText = datatypeText;
            }
        }
    }

    if (nciXmlCde.VALUEDOMAIN[0].UnitOfMeasure[0].length > 0) {
        valueDomain.uom = nciXmlCde.VALUEDOMAIN[0].UnitOfMeasure[0];
    }
    return valueDomain;
}
