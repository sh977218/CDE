export function containerToItemType(container) { // http://hl7.org/fhir/item-type
    // NOT IMPLEMENTED: boolean, time, url, open-choice(choice+string), attachment, reference
    if (container.isScore) return 'display';
    switch (container.datatype) {
        case 'Value List':
            return 'choice';
        case 'Date':
            return ['Hour', 'Minute', 'Second'].indexOf(container.datatypeDate.precision) ? 'dateTime' : 'date';
        case 'Number':
            if (Array.isArray(container.unitsOfMeasure) && container.unitsOfMeasure.length || container.uom) {
                return 'quantity';
            }
            return !container.datatypeNumber || typeof(container.datatypeNumber.precision) !== 'number' || container.datatypeNumber.precision < 0
                ? 'decimal' : 'integer';
        default:
            return container.datatypeText && container.datatypeText.showAsTextArea ? 'text' : 'string';
    }
}

export function containerValueListToCoding(container, value) {
    let pvs = Array.isArray(container.answers) ? container.answers : container.permissibleValues;
    let matches = pvs.filter(a => a.permissibleValue === value);
    if (matches.length) {
        return permissibleValueToCoding(matches[0]);
    }
    return {code: value};
}

export function itemTypeToItemDatatype(type) {
    if ('choice') return 'Coding';
    return type;
}

export function permissibleValueToCoding(pv) {
    return {
        code: pv.permissibleValue,
        display: pv.valueMeaningName && pv.valueMeaningName !== pv.permissibleValue ? pv.valueMeaningName : undefined,
        system: pv.codeSystemName || undefined,
        version: pv.codeSystemVersion || undefined,
    };
}

export function valueToQuantity(container, value, comparator, uomIndex) {
    let quantity = {
        comparator: comparator && comparator !== '=' ? comparator : undefined,
        value: parseFloat(value),
    };
    if (Array.isArray(container.unitsOfMeasure)) {
        let uom = container.unitsOfMeasure[Math.min(uomIndex, container.unitsOfMeasure.length - 1)];
        if (uom) {
            quantity.code = uom.code;
            quantity.system = uom.system;
        }
    } else {
        quantity.unit = container.uom;
    }
}

export function valueToTypedValue(container, type, value, comparator = '=', uomIndex = 0) {
    switch (type) {
        case 'choice':
            return containerValueListToCoding(container, value);
        case 'boolean':
            return !!value;
        case 'quantity':
            return valueToQuantity(container, value, comparator, uomIndex);
        case 'integer':
            return parseInt(value);
        case 'decimal':
            return parseFloat(value);
        default: // handles date(with time) text
            return value;
    }
}
