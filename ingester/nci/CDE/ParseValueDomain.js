const datatypeMapping = {
    'CHARACTER': 'Text',
    'NUMBER': 'Number',
    'ALPHANUMERIC': 'Text',
    'TIME': 'Time',
    'DATE': 'Date',
    'DATETIME': 'Date/Time'
};

exports.parseValueDomain = nciCde => {
    let valueDomain = {};
    if (datatypeMapping[cde.valueDomain.datatype]) {
        cde.valueDomain.datatype = datatypeMapping[cde.valueDomain.datatype];
    }
    if (cde.valueDomain.datatype === 'Number') {
        cde.valueDomain.datatypeNumber = {};
        if (de.VALUEDOMAIN[0].MaximumValue[0].length > 0) {
            cde.valueDomain.datatypeNumber.maxValue = de.VALUEDOMAIN[0].MaximumValue[0];
        }
        if (de.VALUEDOMAIN[0].MinimumValue[0].length > 0) {
            cde.valueDomain.datatypeNumber.minValue = de.VALUEDOMAIN[0].MinimumValue[0];
        }
        if (de.VALUEDOMAIN[0].DecimalPlace[0].length > 0) {
            cde.valueDomain.datatypeNumber.precision = de.VALUEDOMAIN[0].DecimalPlace[0];
        }
    }
    if (cde.valueDomain.datatype === 'Text') {
        cde.valueDomain.datatypeText = {};
        if (de.VALUEDOMAIN[0].MaximumLength[0].length > 0) {
            cde.valueDomain.datatypeText.maxLength = de.VALUEDOMAIN[0].MaximumLength[0];
        }
        if (de.VALUEDOMAIN[0].MinimumLength[0].length > 0) {
            cde.valueDomain.datatypeText.minLength = de.VALUEDOMAIN[0].MinimumLength[0];
        }
    }

    if (de.VALUEDOMAIN[0].ValueDomainType[0] === 'Enumerated') {
        cde.valueDomain.datatypeValueList = {datatype: cde.valueDomain.datatype};
        cde.valueDomain.datatype = "Value List";
    }

    if (de.VALUEDOMAIN[0].UnitOfMeasure[0].length > 0) {
        cde.valueDomain.uom = de.VALUEDOMAIN[0].UnitOfMeasure[0];
    }
    cde.valueDomain.permissibleValues = [];
    if (de.VALUEDOMAIN[0].PermissibleValues[0].PermissibleValues_ITEM) {
        de.VALUEDOMAIN[0].PermissibleValues[0].PermissibleValues_ITEM.forEach(function (pv) {
            var newPv = {
                permissibleValue: entities.decodeXML(pv.VALIDVALUE[0]),
                valueMeaningName: entities.decodeXML(pv.VALUEMEANING[0]),
                valueMeaningDefinition: entities.decodeXML(pv.MEANINGDESCRIPTION[0]),
                codeSystemName: ''
            };
            if (!pv.MEANINGCONCEPTS[0][$attribute]) {
                var valueMeaningCodeString = pv.MEANINGCONCEPTS[0].replace(/,/g, ':');
                newPv.valueMeaningCode = valueMeaningCodeString;

            }
            cde.valueDomain.permissibleValues.push(newPv);
        });
        cde.valueDomain.permissibleValues.sort(function (pv1, pv2) {
            if (pv1.permissibleValue === pv2.permissibleValue) return 0;
            if (pv1.permissibleValue > pv2.permissibleValue) return 1;
            if (pv1.permissibleValue < pv2.permissibleValue) return -1;
        });
    }
    return valueDomain;
};