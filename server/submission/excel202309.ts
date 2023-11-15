import { arrayMismatch, ColumnInformation, valueAsString, valueToArray } from 'server/submission/submissionShared';
import { DataType, fixDatatype, valueDomain } from 'shared/de/dataElement.model';
import { PermissibleValueCodeSystem, permissibleValueCodeSystems } from 'shared/models.model';

export const cdeColumnsOrdered: ColumnInformation[] = [];
export const cdeColumns: Record<string, ColumnInformation> = {
    'CDE Name': {
        order: 0,
        required: true,
        value: null,
        setValue: (withError, de, v) => {
            if (!de.designations) {
                de.designations = []
            }
            de.designations.push({designation: valueAsString(v), tags: []});
        },
    },
    'CDE Data Type': {
        order: 1,
        required: true,
        value: null,
        setValue: (withError, de, v) => {
            const value = valueAsString(v).toLowerCase();
            let type: DataType = 'Text';
            if (value.includes('value list')) {
                type = 'Value List';
            } else if (value.includes('number')) {
                type = 'Number';
            } else if (value.includes('date')) {
                type = 'Date';
            } else if (value.includes('time')) {
                type = 'Time'
            } else if (value.includes('file')) {
                type = 'File';
            } else if (value.includes('geo')) {
                type = 'Geo Location';
            } else if (value.includes('dynamic')) {
                type = 'Dynamic Code List';
            } else if (value.includes('external')) {
                type = 'Externally Defined';
            } else if (value.includes('text')) {
                type = 'Text';
            } else {
                withError('Required', 'CDE Data Type must be one of the following: Value List, Text, Number, Date, Time, Datetime, Geolocation, File/URI/URL.');
            }
            if (value.includes('other')) {
                withError('Manual Intervention', 'Datatype "OTHER", assistance has been requested.');
            }
            if (!de.valueDomain) {
                de.valueDomain = valueDomain();
            }
            de.valueDomain.datatype = type;
            fixDatatype(de.valueDomain);
            const name = (de.designations?.[0]?.designation || '').toLowerCase();
            if (de.valueDomain.datatype !== 'Number' && (
                name.includes('how many') || name.includes('number of') || name.includes('count of') || name.includes('duration')
                || name.includes('how often') || name.includes('how long')
            )) {
                withError('Suggestion', `CDE Data Type is ${de.valueDomain.datatype}, but the CDE seems to ask for a number.`);
            }
            if (de.valueDomain.datatype !== 'Date' && de.valueDomain.datatype !== 'Time' && (
                name.includes('when') || name.includes('date') || name.includes('time')
            )) {
                withError('Suggestion', `CDE Data Type is ${de.valueDomain.datatype}, but the CDE seems to ask for a date or time.`);
            }
        }
    },
    'CDE Definition': {
        order: 2,
        required: true,
        value: null,
        setValue: (withError, de, v) => {
            if (!de.definitions) {
                de.definitions = []
            }
            de.definitions.push({definition: valueAsString(v), tags: []});
        },
    },
    'Preferred Question Text': {
        order: 3,
        required: true,
        value: null,
        setValue: (withError, de, v) => {
            if (!de.designations) {
                de.designations = []
            }
            de.designations.push({designation: valueAsString(v), tags: ['Preferred Question Text']});
        },
    },
    'Unit of Measure': {
        order: 4,
        required: false,
        value: null,
        setValue: (withError, de, v) => {
            const val = valueAsString(v);
            if (!val) {
                if (de.valueDomain?.datatype === 'Number') {
                    withError('Suggestion', 'If CDE Data Type is Number, a unit of measure is usually needed.')
                }
                return;
            }
            if (de.valueDomain?.datatype !== 'Number') {
                withError('Suggestion', `If CDE Data Type is ${de.valueDomain?.datatype}, Unit of Measure should be left blank.`)
            }
            if (!de.valueDomain) {
                de.valueDomain = valueDomain();
            }
            de.valueDomain.uom = val;
        },
    },
    'CDE Source': {
        order: 5,
        required: true,
        value: null,
        setValue: (withError, de, v) => {
            const val = valueAsString(v);
            if (!val) {
                return;
            }
            de.sources = valueToArray(val).map(s => ({sourceName: s}));
        }
    },
    'DEC Concept Terminology Source': {
        order: 6,
        required: false,
        value: null,
        setValue: (withError, de, v) => {
            const val = valueAsString(v);
            if (!val) {
                return;
            }
            if (!de.dataElementConcept) {
                de.dataElementConcept = {};
            }
            de.dataElementConcept.concepts = valueToArray(val).map(system => ({origin: system, type: ''}));
        }
    },
    'Data Element Concept (DEC) Identifier': {
        order: 7,
        required: false,
        value: null,
        setValue: (withError, de, v) => {
            const val = valueAsString(v);
            if (!val) {
                return;
            }
            if (!de.dataElementConcept?.concepts?.length) {
                withError('Required', '"DEC Concept Terminology Source" is required.');
                return;
            }
            const conceptIds = valueToArray(val);
            if (conceptIds.length !== de.dataElementConcept.concepts.length) {
                arrayMismatch(withError, de.dataElementConcept.concepts, conceptIds, 'Concept Sources', 'Concept Identifiers');
                return;
            }
            de.dataElementConcept.concepts.forEach((c, i) => c.originId = conceptIds[i] || undefined);
        }
    },
    'NLM Identifier for NIH CDE Repository': {
        order: 8,
        required: false,
        value: null,
        setValue: (withError, de, v) => {
            const val = valueAsString(v);
            if (!val) {
                return;
            }
            de.tinyId = val;
        }
    },
    'Other Identifier(s)': {
        order: 9,
        required: false,
        value: null,
        setValue: (withError, de, v) => {
            const val = valueAsString(v);
            if (!val) {
                return;
            }
            if (!de.ids) {
                de.ids = [];
            }
            const ids = valueToArray(val);
            ids.forEach(id => {
                de.ids?.push({id, source: de.stewardOrg?.name || ''});
            });
        }
    },
    'CDE Type': {
        order: 10,
        required: false,
        value: null,
        setValue: (withError, de, v, info) => {
            const val = valueAsString(v);
            if (!val) {
                return;
            }
            if (val === 'Composite' || val === 'Bundled Set of Questions') {
                info.bundled = true;
            }
        }
    },
    'Name of Bundle': {
        order: 11,
        required: false,
        value: null,
        setValue: (withError, de, v, info) => {
            const val = valueAsString(v);
            if (!val) {
                if (info.bundled) {
                    withError('Required', 'For "CDE Type" of "Composite" or "Bundled Set of Questions", "Name of Bundle" is required.');
                }
                return;
            }
            if (!info.bundled) {
                withError('Required', 'If a "Name of Bundle" is given, then "CDE Type" is required.');
            }
            info.bundleName = val;
        }
    },
    'Permissible Value (PV) Labels': { // (by combining values in separate rows from original submission)
        order: 12,
        required: false,
        value: null,
        setValue: (withError, de, v) => {
            const val = valueAsString(v);
            if (!val) {
                if (de.valueDomain?.datatype === 'Value List') {
                    withError('Required', 'CDE Data Type is Value List, but Permissible Value Labels are missing.');
                }
                return;
            }
            if (de.valueDomain?.datatype !== 'Value List') {
                withError('Extra', `If CDE Data Type is ${de.valueDomain?.datatype}, Permissible Value should be left blank. Please review datatype.`);
                return;
            }
            de.valueDomain.permissibleValues = valueToArray(val).map(pv => ({permissibleValue: pv, valueMeaningName: pv}));
            if (de.valueDomain.permissibleValues.length === 1) {
                withError('Length', 'CDE Data Type is Value List, but only one Permissible Value Label was provided.');
            }
        }
    },
    'Permissible Value (PV) Definitions': {
        order: 13,
        required: false,
        value: null,
        setValue: (withError, de, v) => {
            const val = valueAsString(v);
            if (!val) {
                if (de.valueDomain?.datatype === 'Value List') {
                    withError('Required', 'CDE Data Type is Value List, but Permissible Value Definitions are missing.');
                }
                return;
            }
            if (de.valueDomain?.datatype !== 'Value List') {
                withError('Extra', `If CDE Data Type is ${de.valueDomain?.datatype}, Permissible Value Definition should be left blank. Please review datatype.`);
                return;
            }
            if (!de.valueDomain.permissibleValues) {
                return;
            }
            const valArray = valueToArray(val, de.valueDomain.permissibleValues.length);
            if (de.valueDomain.permissibleValues.length !== valArray.length) {
                arrayMismatch(withError, de.valueDomain.permissibleValues, valArray, 'PV Labels', 'PV Definitions');
                return;
            }
            de.valueDomain.permissibleValues.forEach((pv, i) => {
                pv.valueMeaningDefinition = valArray[i];
            });
        }
    },
    'Permissible Value (PV) Concept Identifiers': {
        order: 14,
        required: false,
        value: null,
        setValue: (withError, de, v) => {
            const val = valueAsString(v);
            if (!val) {
                return;
            }
            if (de.valueDomain?.datatype !== 'Value List') {
                withError('Extra', `If CDE Data Type is ${de.valueDomain?.datatype}, Permissible Value Concept Code should be left blank. Please review datatype.`);
                return;
            }
            if (!de.valueDomain.permissibleValues) {
                return;
            }
            const valArray = valueToArray(val, de.valueDomain.permissibleValues.length);
            if (de.valueDomain.permissibleValues.length !== valArray.length) {
                arrayMismatch(withError, de.valueDomain.permissibleValues, valArray, 'PV Labels', 'PV Concept Identifiers');
                return;
            }
            de.valueDomain.permissibleValues.forEach((pv, i) => {
                pv.conceptId = valArray[i];
            });
        },
    },
    'Permissible Value (PV) Terminology Sources': {
        order: 15,
        required: false,
        value: null,
        setValue: (withError, de, v) => {
            const val = valueAsString(v);
            if (!val) {
                return;
            }
            if (de.valueDomain?.datatype !== 'Value List') {
                withError('Extra',
                    `If CDE Data Type is ${de.valueDomain?.datatype}, Permissible Value Concept Source should be left blank. Please review datatype.`);
                return;
            }
            if (!de.valueDomain.permissibleValues) {
                return;
            }
            const valArray = valueToArray(val, de.valueDomain.permissibleValues.length);
            if (de.valueDomain.permissibleValues.length !== valArray.length) {
                arrayMismatch(withError, de.valueDomain.permissibleValues, valArray, 'PV Labels', 'PV Terminology Sources');
                return;
            }
            de.valueDomain.permissibleValues.forEach((pv, i) => {
                pv.conceptSource = valArray[i];
            });
        }
    },
    'Codes for Permissible Value': {
        order: 16,
        required: false,
        value: null,
        setValue: (withError, de, v) => {
            const val = valueAsString(v);
            if (!val) {
                return;
            }
            if (de.valueDomain?.datatype !== 'Value List') {
                withError('Extra', `If CDE Data Type is ${de.valueDomain?.datatype}, Permissible Value Code should be left blank. Please review datatype.`);
                return;
            }
            if (!de.valueDomain.permissibleValues) {
                return;
            }
            const valArray = valueToArray(val, de.valueDomain.permissibleValues.length);
            if (de.valueDomain.permissibleValues.length !== valArray.length) {
                arrayMismatch(withError, de.valueDomain.permissibleValues, valArray, 'PV Labels', 'PV Codes');
                return;
            }
            de.valueDomain.permissibleValues.forEach((pv, i) => {
                pv.valueMeaningCode = valArray[i];
            });
        }
    },
    'Permissible Value Code Systems': {
        order: 17,
        required: false,
        value: null,
        setValue: (withError, de, v) => {
            const val = valueAsString(v);
            if (!val) {
                return;
            }
            if (de.valueDomain?.datatype !== 'Value List') {
                withError('Extra', `If CDE Data Type is ${de.valueDomain?.datatype}, Permissible Value Code System should be left blank. Please review datatype.`);
                return;
            }
            if (!de.valueDomain.permissibleValues) {
                return;
            }
            const valArray = valueToArray(val, de.valueDomain.permissibleValues.length);
            if (de.valueDomain.permissibleValues.length !== valArray.length) {
                arrayMismatch(withError, de.valueDomain.permissibleValues, valArray, 'PV Labels', 'PV Code Systems');
                return;
            }
            de.valueDomain.permissibleValues.forEach((pv, i) => {
                const codeSystem = valArray[i] as PermissibleValueCodeSystem;
                if (permissibleValueCodeSystems.includes(codeSystem)) {
                    pv.codeSystemName = codeSystem;
                } else {
                    withError('Code', `PV code system "${codeSystem}" is not recognized.`);
                }
            });
        }
    },
    References: {
        order: 18,
        required: false,
        value: null,
        setValue: (withError, de, v) => {
            const val = valueAsString(v);
            if (!val) {
                return;
            }
            de.referenceDocuments = valueToArray(val).map(s => ({text: s}));
        }
    },
    'Keywords/Tags': {
        order: 19,
        required: false,
        value: null,
        setValue: (withError, de, v) => {
            const val = valueAsString(v);
            if (!val) {
                return;
            }
            if (!de.properties) {
                de.properties = [];
            }
            de.properties.push({key: 'CDE Tags', value: val});
        }
    }
};

Object.keys(cdeColumns).forEach((key, i) => {
    const columnInfo = cdeColumns[key];
    if (columnInfo.order !== i) {
        throw new Error(`ERROR: Column Information Order is wrong: ${columnInfo.order} should be ${i}`);
    }
    cdeColumnsOrdered[i] = columnInfo;
});
