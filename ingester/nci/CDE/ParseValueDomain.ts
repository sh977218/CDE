const datatypeMapping = {
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

export function parseValueDomain(nciXmlCde) {
    const valueDomain: any = {
        permissibleValues: []
    };
    const nciDataTypeString = nciXmlCde.VALUEDOMAIN[0].Datatype[0];
    const nciDataType = nciDataTypeString.trim().toLowerCase();
    if (!datatypeMapping[nciDataType]) {
        console.log('No Mapping in ParseValueDomain ' + nciDataType);
        process.exit(1);
    }
    valueDomain.datatype = datatypeMapping[nciDataType];

    if (valueDomain.datatype === 'Number') {
        valueDomain.datatypeNumber = {};
        if (nciXmlCde.VALUEDOMAIN[0].MaximumValue[0].length > 0) {
            valueDomain.datatypeNumber.maxValue = nciXmlCde.VALUEDOMAIN[0].MaximumValue[0];
        }
        if (nciXmlCde.VALUEDOMAIN[0].MinimumValue[0].length > 0) {
            valueDomain.datatypeNumber.minValue = nciXmlCde.VALUEDOMAIN[0].MinimumValue[0];
        }
        if (nciXmlCde.VALUEDOMAIN[0].DecimalPlace[0].length > 0) {
            valueDomain.datatypeNumber.precision = nciXmlCde.VALUEDOMAIN[0].DecimalPlace[0];
        }
    }
    if (valueDomain.datatype === 'Text') {
        valueDomain.datatypeText = {};
        if (nciXmlCde.VALUEDOMAIN[0].MaximumLength[0].length > 0) {
            valueDomain.datatypeText.maxLength = nciXmlCde.VALUEDOMAIN[0].MaximumLength[0];
        }
        if (nciXmlCde.VALUEDOMAIN[0].MinimumLength[0].length > 0) {
            valueDomain.datatypeText.minLength = nciXmlCde.VALUEDOMAIN[0].MinimumLength[0];
        }
    }

    if (nciXmlCde.VALUEDOMAIN[0].ValueDomainType[0] === 'Enumerated') {
        valueDomain.datatypeValueList = {datatype: valueDomain.datatype};
        valueDomain.datatype = 'Value List';
    }

    if (nciXmlCde.VALUEDOMAIN[0].UnitOfMeasure[0].length > 0) {
        valueDomain.uom = nciXmlCde.VALUEDOMAIN[0].UnitOfMeasure[0];
    }
    if (nciXmlCde.VALUEDOMAIN[0].PermissibleValues[0].PermissibleValues_ITEM) {
        nciXmlCde.VALUEDOMAIN[0].PermissibleValues[0].PermissibleValues_ITEM.forEach(pv => {
            const newPv: any = {
                permissibleValue: pv.VALIDVALUE[0],
                valueMeaningName: pv.VALUEMEANING[0],
                valueMeaningDefinition: pv.MEANINGDESCRIPTION[0],
                codeSystemName: pv.MEANINGCONCEPTORIGIN[0].split(',')[0]
            };
            if (!pv.MEANINGCONCEPTS[0].attribute) {
                const valueMeaningCodeString = pv.MEANINGCONCEPTS[0].replace(/,/g, ':');
                newPv.valueMeaningCode = valueMeaningCodeString;

            }
            valueDomain.permissibleValues.push(newPv);
        });
        valueDomain.permissibleValues.sort((a, b) => a.permissibleValue - b.permissibleValue
        );
    }
    return valueDomain;
}
