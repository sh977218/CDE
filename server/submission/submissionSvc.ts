import { EventEmitter } from 'events';
import { Response } from 'express';
import {
    LoadData,
    ValidationErrors,
    VerifySubmissionFileProgress,
    VerifySubmissionFileReport
} from 'shared/boundaryInterfaces/API/submission';
import { keys } from 'shared/builtIn';
import { DataElement, DataType, fixDatatype, valueDomain } from 'shared/de/dataElement.model';
import { CdeForm, FormQuestion } from 'shared/form/form.model';
import {
    Cb,
    Cb1,
    PermissibleValue,
    PermissibleValueCodeSystem,
    permissibleValueCodeSystems
} from 'shared/models.model';
import {
    cellValue,
    combineLines,
    ExcelValue,
    expectFormTemplate,
    extractFormValue,
    Row,
    trim, WithError
} from 'shared/node/io/excel';
import { mapSeries, nextTick } from 'shared/promise';
import { schedulingExecutor } from 'shared/scheduling';
import { isString, noop } from 'shared/util';
import { CDE_SYSTEM_TO_UMLS_SYSTEM_MAP, searchBySystemAndCode } from 'server/uts/utsSvc';
import * as spellChecker from 'simple-spellchecker';
import { utils, WorkBook } from 'xlsx';

interface ColumnInformation {
    order: number
    required: boolean,
    value: ExcelValue | null,
    setValue: (withError: WithError, de: Partial<DataElement>, v: ExcelValue, info: RowInformation) => void,
}

interface RowInformation {
    bundled?: boolean;
    bundleName?: string;
}

const columnNumber: ColumnInformation[]= [];
const excelCdeColumnsOrdered: ColumnInformation[] = [];
const excelCdeColumns: Record<string, ColumnInformation> = {
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
                withError('Length', `There are ${de.dataElementConcept.concepts.length} Concept Sources but ${conceptIds.length} Concept Identifiers. Must be the same count.`);
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
    'CDE Type': {
        order: 9,
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
        order: 10,
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
        order: 11,
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
        order: 12,
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
                withError('Length', `There are ${de.valueDomain.permissibleValues.length} PV Labels but ${valArray.length} PV Definitions. Must be the same count.`);
                return;
            }
            de.valueDomain.permissibleValues.forEach((pv, i) => {
                pv.valueMeaningDefinition = valArray[i];
            });
        }
    },
    'Permissible Value (PV) Concept Identifiers': {
        order: 13,
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
                withError('Length', `There are ${de.valueDomain.permissibleValues.length} PV Labels but ${valArray.length} PV Concept Identifiers. Must be the same count.`);
                return;
            }
            de.valueDomain.permissibleValues.forEach((pv, i) => {
                pv.conceptId = valArray[i];
            });
        },
    },
    'Permissible Value (PV) Terminology Sources': {
        order: 14,
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
                withError('Length', `There are ${de.valueDomain.permissibleValues.length} PV Labels but ${valArray.length} PV Terminology Sources. Must be the same count.`);
                return;
            }
            de.valueDomain.permissibleValues.forEach((pv, i) => {
                pv.conceptSource = valArray[i];
            });
        }
    },
    'Codes for Permissible Value': {
        order: 15,
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
                withError('Length', `The are ${de.valueDomain.permissibleValues.length} PV Labels but ${valArray.length} PV Codes. Must be the same count.`);
                return;
            }
            de.valueDomain.permissibleValues.forEach((pv, i) => {
                pv.valueMeaningCode = valArray[i];
            });
        }
    },
    'Permissible Value Code Systems': {
        order: 16,
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
                withError('Length', `There are ${de.valueDomain.permissibleValues.length} PV Labels but ${valArray.length} PV Code Systems. Must be the same count.`);
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
        order: 17,
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
        order: 18,
        required: false,
        value: null,
        setValue: (withError, de, v) => {
            const val = valueAsString(v);
            if (!val) {
                return;
            }
            if (!de.properties) {
                de.properties = []
            }
            de.properties.push({key: 'CDE Tags', value: val});
        }
    }
};

const spellCheckColumns = [
    {
        prop: 'designations',
        subProps: ['designation']
    },
    {
        prop: 'definitions',
        subProps: ['definition']
    }
];

Object.keys(excelCdeColumns).forEach((key, i) => {
    const columnInfo = excelCdeColumns[key];
    if (columnInfo.order !== i) {
        throw new Error(`ERROR: Column Information Order is wrong: ${columnInfo.order} should be ${i}`);
    }
    excelCdeColumnsOrdered[i] = columnInfo;
});

export function processWorkBook(wb: WorkBook, progressResponses?: EventEmitter):
    Promise<VerifySubmissionFileReport> {
    let res: Response | null = null;
    const validationErrors: ValidationErrors = {
        cover: [],
        CDEs: [],
    };
    const data: LoadData = {
        metadata: {
            name: null,
            version: null,
        },
        dataElements: [],
        forms: [],
    };
    const progress: VerifySubmissionFileProgress = {
        row: 0,
        rowTotal: 0,
        cde: 0,
        code: 0,
        codeTotal: 0
    };
    const {run: execute} = schedulingExecutor(100, 0); // limit total server resources used
    let browserTimer: number = 0;
    let closeoutPromiseResolve: Cb | void;
    let updateHandler: Cb1<true | void> | void;
    if (progressResponses) {
        progressResponses.on('data', (r: Response) => {
            res = r;
            if (closeoutPromiseResolve) {
                res.send(progress);
                res = null;
                closeoutPromiseResolve();
            }
        });
        updateHandler = (done: true | void) => {
            if (done) {
                clearInterval(browserTimer);
                progress.report = {data, validationErrors};
            }
            if (res) {
                res.send(progress);
                res = null;
            } else {
                if (done) {
                    return new Promise<void>(resolve => {
                        closeoutPromiseResolve = resolve;
                    });
                }
            }
        }
        nextTick().then(updateHandler);
        browserTimer = setInterval(updateHandler, 5000) as any;
    }
    processSheetCover();
    return processSheetCDEs()
        .then(async () => {
            if (updateHandler) {
                await updateHandler(true);
            }
            return {data, validationErrors};
        });

    function processSheetCover(): boolean {
        const errors = validationErrors.cover;
        const withError = withErrorCapture('Cover Sheet', errors);
        const coverSheet = wb.Sheets['Cover Sheet'];
        if (!coverSheet) {
            errors.push('Worksheet "Cover Sheet" is missing.');
            return false;
        }
        const rows = utils.sheet_to_json<(string | null)[]>(coverSheet, {header: 1, defval: null});
        let row = 0;

        expectFormTemplate(withError(row), rows[row++], {7: 'v.2023.03'},
            'Submission does not use the current submission template (version v.2023.03). No action is needed from you, but our team may contact you if additional information is required. The current version can always be found in the NLM Common Data Elements Team, in the General channel, under Files, in the CDE_Governance folder.');
        expectFormTemplate(withError(row), rows[row++], {1: 'CDE Governance Submission Cover Sheet'});
        row++;
        row++;
        expectFormTemplate(withError(row), rows[row++], {1: 'Submission Information'});
        const submissionName = extractFormValue(withError(row), rows[row++], 2, 9, {1: '*Submission title:'});
        row++;
        const submissionUrl = extractFormValue(withError(row), rows[row++], 2, 9, {1: 'Submission URL:'});
        row++;
        const submissionVersion = extractFormValue(withError(row), rows[row], 2, 9, {1: '*Version number:'});
        const numberCDEs = extractFormValue(withError(row), rows[row++], 7, 9, {5: 'Number of CDEs in this submission:'});
        row++;
        row++;
        row++;
        row++;
        const submissionDescription = extractFormValue(withError(row), rows[row++], 2, 9, {1: '*Submission description:'});
        // checkbox doesn't work, fields are a repeat from submission anyway

        if (submissionName && typeof submissionName === 'string') {
            data.metadata.name = submissionName;
        } else {
            errors.push('Submission name is required.');
        }

        if (submissionVersion && (typeof submissionVersion === 'number' || typeof submissionVersion === 'string')) {
            data.metadata.version = valueAsString(submissionVersion) || null;
        } else {
            errors.push('Submission version is required.');
        }

        return !errors.length;
    }

    async function processSheetCDEs(): Promise<boolean> {
        const errors = validationErrors.CDEs;
        const withError = withErrorCapture('CDEs sheet', errors);
        const cdesSheet = wb.Sheets.CDEs;
        if (!cdesSheet) {
            errors.push('Worksheet "CDEs" is missing.');
            return false;
        }
        const rows = utils.sheet_to_json<Row>(cdesSheet, {header: 1, defval: null});
        progress.rowTotal += rows.length;

        const columnErrors = getColumnPositions(rows[0]);
        if (columnErrors.length) {
            columnErrors.forEach(message => withError(1)('Column Heading', message));
            return !errors.length;
        }

        expectFormTemplate(withError(2), rows[1], {0: 'Required', 1: 'Required'});

        if (!valueAsString(rows[2][0]).startsWith('A unique and unambiguous label to help users')) {
            withError(3)('Template', 'Description Row is missing.');
            return !errors.length;
        }

        progress.row += 3;
        const deProcessing: Promise<void>[] = [];
        const labelsMap: Record<string, number[]> = {};
        await mapSeries(rows.slice(3), (row, i) => nextTick().then(() => { // sync processing one at a time
            const rowNumber = i + 4;
            const withErrorRow = withError(rowNumber);
            progress.row++;
            const info: RowInformation = {};
            const de = storeCdeData(withErrorRow, row, info);
            if (de) {
                progress.cde++;
                data.dataElements.push(de);

                if (info.bundleName) {
                    bundle(data.forms, info.bundleName, de);
                }

                const label = de.designations?.[0].designation;
                if (label) {
                    const m = labelsMap[label];
                    if (m) {
                        m.push(rowNumber);
                    } else {
                        labelsMap[label] = [rowNumber];
                    }
                }

                deProcessing.push(processDe(withErrorRow, de)); // async, no wait
            }
        }));
        Object.keys(labelsMap).forEach(label => {
            const m = labelsMap[label];
            if (m.length > 1) {
                withError('(' + m.join(', ') + ')')('Suggestion', 'In most cases, Preferred Question Text should be unique. Duplicates were found.');
            }
        });

        async function processDe(withError: WithError, de: Partial<DataElement>) {
            if (!de) {
                return;
            }
            await processIds(withError, de);
            if(de.valueDomain?.datatype === 'Value List') {
                await processPVs(withError, de);
            }
            spellcheckDe(withError, de);
        }

        await Promise.all(deProcessing);

        return !errors.length;
    }

    function processIds(withError: WithError, dataElement: Partial<DataElement>) {
        // return Promise.all(dataElement.ids?.map(id => {
        //     if (id.source !== 'NLM' && id.id) {
        //         progress.codeTotal++;
        //         return execute(() => umlsServerRequest(`/rest/content/current/CUI/${req.params.cui}`).then(data => {
        //             progress.code++
        //         }));
        //     }
        // }));
    }

    async function processPVs(withError: WithError, dataElement: Partial<DataElement>) {
        if (dataElement.valueDomain?.datatype === 'Value List' && dataElement.valueDomain?.permissibleValues) {
            return Promise.all(dataElement.valueDomain.permissibleValues.map(pv => validateCodes(withError, pv)));
        }
    }

    function validateCodes(withError: WithError, pv: PermissibleValue): Promise<void> {
        return Promise.all([
            validateCode(withError, pv.codeSystemName, pv.valueMeaningCode, pv.valueMeaningName),
            validateCode(withError, pv.conceptSource, pv.conceptId, null)
        ]).then(noop, noop);
    }

    function validateCode(withError: WithError, system?: string, code?: string, name?: string | null): Promise<void> {
        if (!system || !code) {
            return Promise.resolve();
        }

        const umlsSystems = (system ? system.split(/[,:]/) : [])
            .map(s => s && CDE_SYSTEM_TO_UMLS_SYSTEM_MAP[trim(s)]).filter(s => s)
        const umlsCodes = (code ? code.split(/[,:]/) : [])
            .map(c => trim(c)).filter(c => c);
        if (!umlsSystems.length || !umlsCodes.length) {
            return Promise.resolve();
        }
        if (umlsSystems.length === 1 && umlsCodes.length > 1) {
            umlsSystems.length = umlsCodes.length;
            umlsSystems.fill(umlsSystems[0]);
        }
        if (umlsSystems.length !== umlsCodes.length) {
            withError('Length', `In single PV, there are ${umlsCodes.length} codes but ${umlsSystems.length} systems.`);
            return Promise.resolve();
        }

        return Promise.all(
            umlsCodes.map((c, i) => {
                progress.codeTotal++;
                return execute(() => searchBySystemAndCode(umlsSystems[i] || umlsSystems[0], trim(c)).then(
                    dataRes => {
                        progress.code++;
                        if (!dataRes || dataRes.startsWith('<html')) {
                            return [];
                        }
                        const response = JSON.parse(dataRes);
                        if (!Array.isArray(response.result)) {
                            return [];
                        }
                        return (response.result as any[]).map(r => r.name as string);
                    },
                    err => {
                        progress.code++;
                        throw err;
                    })
                );
            })
        ).then(
            results => {
                function match(results: string[][], name: string): boolean {
                    if (results.length === 0) {
                        return false;
                    }
                    return results[0].filter(n => name.startsWith(n.toLowerCase())).some(n => {
                        let newName = name.substr(n.length).trim();
                        if (!newName) {
                            return true;
                        }
                        if (newName.startsWith('a ')) {
                            newName = newName.substr(2);
                        }
                        return match(results.slice(1), newName);
                    });
                }
                if (name === null) {
                    return;
                }
                if (!name || !match(results, name.toLowerCase())) {
                    withError('Code',`UMLS validation for ${system}/${code} "${results.join()}" does not match "${name}".`);
                }
            },
            err => {
                withError('Code', `UMLS validation for ${system}/${code} failed with error: ${err}.`);
            }
        );
    }

    function spellcheckDe(withError: WithError, dataElement: Partial<DataElement>){
        const dictionary = spellChecker.getDictionarySync('en-US');
        for (const field of spellCheckColumns) {
            const prop: keyof DataElement = field.prop as keyof DataElement;
            let values = dataElement[prop];

            if(Array.isArray(values)){
                values = values.map((v) => {
                    let subProp = v;
                    if(field.subProps.length > 0){
                        field.subProps.forEach((sp) => {
                            if(subProp?.[sp]){
                                subProp = subProp[sp];
                            }
                        });
                    }
                    return subProp;
                });
            }

            if (!!values) {
                const terms = values.join(' ').replace(/([\s*'|—="!…:_.,;(){}–\-`?/\[\]]+)/g, '§sep§').split('§sep§');
                for (let term of terms) {
                    if (!/\d/.test(term) && term.toUpperCase() !== term) {
                        term = term.trim().toLowerCase();
                        if (!dictionary.spellCheck(term)) {
                            withError('Spellcheck', `"${term}" is misspelled in "${field.prop}" property.`);
                        }
                    }
                }
            }
        }
    }
}

function bundle(forms: Partial<CdeForm>[], name: string, de: Partial<DataElement>) {
    let form = forms.find(form => form.designations?.[0].designation === name);
    if (!form) {
        form = {formElements: [], designations: [{designation: name}]};
        forms.push(form);
    }
    if (!form.formElements) {
        form.formElements = [];
    }

    const q = new FormQuestion();
    q.label = q.question.cde.name = de.designations?.[0] ? de.designations[0].designation : '';
    q.question.datatype = de.valueDomain?.datatype || 'Text';

    form.formElements.push(q);
}

function getColumnPositions(headerRow: Row): string[] {
    const expectedColumns: string[] = [];
    const optionalColumns: string[] = [];
    keys(excelCdeColumns).forEach(column => {
        if (excelCdeColumns[column].required) {
            expectedColumns.push(column);
        } else {
            optionalColumns.push(column);
        }
    })
    const errors = headerRow.map((h, i) => {
        const heading = combineLines(valueAsString(h));
        const headingMatch = excelCdeColumns[heading];
        if (!headingMatch) {
            return `Worksheet Column "${heading}" is incorrect. Please remove to continue.`;
        }
        columnNumber[i] = headingMatch;
        let match = expectedColumns.indexOf(heading);
        if (match > -1) {
            expectedColumns.splice(match, 1);
        }
        match = optionalColumns.indexOf(heading);
        if (match > -1) {
            optionalColumns.splice(match, 1);
        }
    })
        .filter(isString)
        .concat(expectedColumns.map(columnHeading => `Required Column "${columnHeading}" was not found in the worksheet. Add this column to continue.`));
    return errors.length
        ? errors.concat(optionalColumns.map(columnHeading => `Optional Column "${columnHeading}" not used yet in the worksheet. This is okay.`))
        : errors;
}

function storeCdeData(withError: WithError, row: Row, info: RowInformation): Partial<DataElement> | null {
    if (row.length < 19) {
        withError('Template', `Row length ${row.length} is less than the required 19 columns.`);
        return null;
    }
    if (row.every(cell => cell === null)) {
        return null;
    }
    if (typeof row[0] === 'string' && row[0].startsWith('[ if you need more rows,')) {
        return null;
    }
    row.forEach((cell, i) => {
        const value = cellValue(cell);
        const columnInformation = columnNumber[i];
        if (!columnInformation) {
            withError('Template',`column ${i} is missing.`);
            return;
        }
        if (columnInformation.required && value === null) {
            withError('Required', `Column ${i}: Required but no value provided.`);
        }
        columnInformation.value = value;
    });
    const de: Partial<DataElement> = {};
    excelCdeColumnsOrdered.forEach(columnInfo => {
        columnInfo.setValue(withError, de, columnInfo.value, info);
    });
    return de;
}

function valueAsString(v: ExcelValue): string {
    return v ? trim(v + '') : '';
}

function valueToArray(value: string, len: number = -1): string[] {
    const valueArray = value.split('|');
    if (valueArray.length === 1 && len > 1) {
        valueArray.length = len;
        valueArray.fill(valueArray[0]);
    }
    valueArray.forEach((value, index, array) => {
        array[index] = trim(value);
    });
    return valueArray;
}

function withErrorCapture(location: string, errors: string[]) {
    return (subLocation: string | number): WithError =>
        (type, message) =>
            errors.push(location + ':' + subLocation + ':' + type + ':' + message);
}
