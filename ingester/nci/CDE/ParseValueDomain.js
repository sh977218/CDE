const datatypeMapping = {
    'ALPHANUMERIC': 'Text',
    'CHARACTER': 'Text',
    'Integer': 'Number',
    'NUMBER': 'Number',
    'TIME': 'Time',
    'DATE': 'Date',
    'SAS Date': 'Date',
    'DATETIME': 'Date/Time'
};

exports.parseValueDomain = nciCde => {
    let valueDomain = {
        permissibleValues: []
    };
    let nciDataType = nciCde.VALUEDOMAIN[0].Datatype[0];
    if (!datatypeMapping[nciDataType]) throw 'No Mapping in ParseValueDomain ' + nciDataType;
    valueDomain.datatype = datatypeMapping[nciDataType];

    if (valueDomain.datatype === 'Number') {
        valueDomain.datatypeNumber = {};
        if (nciCde.VALUEDOMAIN[0].MaximumValue[0].length > 0) {
            valueDomain.datatypeNumber.maxValue = nciCde.VALUEDOMAIN[0].MaximumValue[0];
        }
        if (nciCde.VALUEDOMAIN[0].MinimumValue[0].length > 0) {
            valueDomain.datatypeNumber.minValue = nciCde.VALUEDOMAIN[0].MinimumValue[0];
        }
        if (nciCde.VALUEDOMAIN[0].DecimalPlace[0].length > 0) {
            valueDomain.datatypeNumber.precision = nciCde.VALUEDOMAIN[0].DecimalPlace[0];
        }
    }
    if (valueDomain.datatype === 'Text') {
        valueDomain.datatypeText = {};
        if (nciCde.VALUEDOMAIN[0].MaximumLength[0].length > 0) {
            valueDomain.datatypeText.maxLength = nciCde.VALUEDOMAIN[0].MaximumLength[0];
        }
        if (nciCde.VALUEDOMAIN[0].MinimumLength[0].length > 0) {
            valueDomain.datatypeText.minLength = nciCde.VALUEDOMAIN[0].MinimumLength[0];
        }
    }

    if (nciCde.VALUEDOMAIN[0].ValueDomainType[0] === 'Enumerated') {
        valueDomain.datatypeValueList = {datatype: valueDomain.datatype};
        valueDomain.datatype = "Value List";
    }

    if (nciCde.VALUEDOMAIN[0].UnitOfMeasure[0].length > 0) {
        valueDomain.uom = nciCde.VALUEDOMAIN[0].UnitOfMeasure[0];
    }
    if (nciCde.VALUEDOMAIN[0].PermissibleValues[0].PermissibleValues_ITEM) {
        nciCde.VALUEDOMAIN[0].PermissibleValues[0].PermissibleValues_ITEM.forEach(pv => {
            let newPv = {
                permissibleValue: pv.VALIDVALUE[0],
                valueMeaningName: pv.VALUEMEANING[0],
                valueMeaningDefinition: pv.MEANINGDESCRIPTION[0],
                codeSystemName: pv.MEANINGCONCEPTORIGIN[0].split(',')[0]
            };
            if (!pv.MEANINGCONCEPTS[0]['attribute']) {
                let valueMeaningCodeString = pv.MEANINGCONCEPTS[0].replace(/,/g, ':');
                newPv.valueMeaningCode = valueMeaningCodeString;

            }
            valueDomain.permissibleValues.push(newPv);
        });
        valueDomain.permissibleValues.sort((a, b) => a.permissibleValue - b.permissibleValue
        );
    }
    return valueDomain;
};