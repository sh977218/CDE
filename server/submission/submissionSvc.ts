import { EventEmitter } from 'events';
import { Response } from 'express';
import {
    LoadData,
    ValidationErrors,
    VerifySubmissionFileProgress,
    VerifySubmissionFileReport
} from 'shared/boundaryInterfaces/API/submission';
import { DataElement, DataType, fixDatatype, valueDomain } from 'shared/de/dataElement.model';
import { PermissibleValueCodeSystem, permissibleValueCodeSystems } from 'shared/models.model';
import {
    cellValue,
    combineLines,
    ExcelValue,
    expectFormTemplate,
    extractFormValue,
    Row,
    trim, WithError
} from 'shared/node/io/excel';
import { schedulingExecutor } from 'shared/scheduling';
import { utils, WorkBook } from 'xlsx';
import { delay, mapSeries, nextTick } from 'shared/promise';
import { validateAgainstUMLS } from 'server/loader/validators';

type ValidationErrors = Record<'CDEs' | 'cover', string[]>;

interface ColumnInformation {
    order: number
    required: boolean,
    value: ExcelValue | null,
    setValue: (de: Partial<DataElement>, v: ExcelValue) => void,
}

const columnNumber: ColumnInformation[]= [];
const excelCdeColumnsOrdered: ColumnInformation[] = [];
const excelCdeColumns: Record<string, ColumnInformation> = {
    'CDE Name': {
        order: 0,
        required: true,
        value: null,
        setValue: (de, v) => {
            if (!de.designations) {
                de.designations = []
            }
            de.designations.push({designation: trim(v + ''), tags: []});
        },
    },
    'CDE Data Type': {
        order: 1,
        required: true,
        value: null,
        setValue: (de, v) => {
            const value = (v + '').toLowerCase();
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
            }
            if (value.includes('other')) {
                throw 'Datatype "OTHER", provide assistance' as any;
            }
            if (!de.valueDomain) {
                de.valueDomain = valueDomain();
            }
            de.valueDomain.datatype = type;
            fixDatatype(de.valueDomain);
        }
    },
    'CDE Definition': {
        order: 2,
        required: true,
        value: null,
        setValue: (de, v) => {
            if (!de.definitions) {
                de.definitions = []
            }
            de.definitions.push({definition: trim(v + ''), tags: []});
        },
    },
    'Preferred Question Text': {
        order: 3,
        required: true,
        value: null,
        setValue: (de, v) => {
            if (!de.designations) {
                de.designations = []
            }
            de.designations.push({designation: trim(v + ''), tags: ['Preferred Question Text']});
        },
    },
    'Unit of Measure': {
        order: 4,
        required: false,
        value: null,
        setValue: (de, v) => {
            const val = trim(v + '');
            if (!val) {
                return;
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
        setValue: (de, v) => {
            const val = trim(v + '');
            if (!val) {
                return;
            }
            de.sources = val.split('|').map(s => ({sourceName: trim(s)}));
        }
    },
    'DEC Concept Terminology Source': {
        order: 6,
        required: false,
        value: null,
        setValue: (de, v) => {
            const val = trim(v + '');
            if (!val) {
                return;
            }
            if (!de.dataElementConcept) {
                de.dataElementConcept = {};
            }
            de.dataElementConcept.concepts = val.split('|').map(system => ({origin: trim(system), type: ''}));
        }
    },
    'Data Element Concept (DEC) Identifier': {
        order: 7,
        required: false,
        value: null,
        setValue: (de, v) => {
            const val = trim(v + '');
            if (!val) {
                return;
            }
            if (!de.dataElementConcept?.concepts?.length) {
                throw '"DEC Concept Terminology Source" is required' as any;
            }
            const conceptIds = val.split('|');
            if (conceptIds.length !== de.dataElementConcept.concepts.length) {
                throw 'Concept Identifier, Concept Source, mismatch. Must be the same length' as any;
            }
            de.dataElementConcept.concepts.forEach((c, i) => c.originId = conceptIds[i] || undefined);
        }
    },
    'NLM Identifier for NIH CDE Repository': {
        order: 8,
        required: false,
        value: null,
        setValue: (de, v) => {
            const val = trim(v + '');
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
        setValue: (de, v) => {
            const val = trim(v + '');
            if (!val) {
                return;
            }
            if (val === 'Composite' || val === 'Bundled Set of Questions') {
                throw `Not Supported operation: ${val}` as any;
            }
        }
    },
    'Name of Bundle': {
        order: 10,
        required: false,
        value: null,
        setValue: (de, v) => {
            const val = trim(v + '');
            if (!val) {
                return;
            }
            throw `Not Supported operation: Bundle Name` as any;
        }
    },
    'Permissible Value (PV) Labels': { // (by combining values in separate rows from original submission)
        order: 11,
        required: false,
        value: null,
        setValue: (de, v) => {
            const val = trim(v + '');
            if (!val) {
                if (de.valueDomain?.datatype === 'Value List') {
                    throw 'Type Value List but no Permissible Value provided' as any;
                }
                return;
            }
            if (de.valueDomain?.datatype !== 'Value List') {
                throw `Type ${de.valueDomain?.datatype} should not have a Permissible Value` as any;
            }
            de.valueDomain.permissibleValues = val.split('|').map(pv => ({permissibleValue: trim(pv)}));
        }
    },
    'Permissible Value (PV) Definitions': {
        order: 12,
        required: false,
        value: null,
        setValue: (de, v) => {
            const val = trim(v + '');
            if (!val) {
                if (de.valueDomain?.datatype === 'Value List') {
                    throw 'Type Value List but no Permissible Value Definitions provided' as any;
                }
                return;
            }
            if (de.valueDomain?.datatype !== 'Value List') {
                throw `Type ${de.valueDomain?.datatype} should not have a Permissible Value Definition` as any;
            }
            if (!de.valueDomain.permissibleValues) {
                throw `Permissible Values missing` as any;
            }
            const valArray = val.split('|');
            if (de.valueDomain.permissibleValues.length !== valArray.length) {
                throw `PV length ${de.valueDomain.permissibleValues.length}, PV definitions length ${valArray.length}, mismatch. Must be the same length.` as any;
            }
            de.valueDomain.permissibleValues.forEach((pv, i) => {
                pv.valueMeaningDefinition = trim(valArray[i]);
            });
        }
    },
    'Permissible Value (PV) Concept Identifiers': {
        order: 13,
        required: false,
        value: null,
        setValue: (de, v) => {
            const val = trim(v + '');
            if (!val) {
                return;
            }
            if (de.valueDomain?.datatype !== 'Value List') {
                throw `Type ${de.valueDomain?.datatype} should not have a Permissible Value Concept Code` as any;
            }
            if (!de.valueDomain.permissibleValues) {
                throw `Permissible Values missing` as any;
            }
            const valArray = val.split('|');
            if (de.valueDomain.permissibleValues.length !== valArray.length) {
                throw `PV length ${de.valueDomain.permissibleValues.length}, PV concepts Code length ${valArray.length}, mismatch. Must be the same length.` as any;
            }
            de.valueDomain.permissibleValues.forEach((pv, i) => {
                pv.conceptId = trim(valArray[i]);
            });
        },
    },
    'Permissible Value (PV) Terminology Sources': {
        order: 14,
        required: false,
        value: null,
        setValue: (de, v) => {
            const val = trim(v + '');
            if (!val) {
                return;
            }
            if (de.valueDomain?.datatype !== 'Value List') {
                throw `Type ${de.valueDomain?.datatype} should not have a Permissible Value Concept Source` as any;
            }
            if (!de.valueDomain.permissibleValues) {
                throw `Permissible Values missing` as any;
            }
            const valArray = val.split('|');
            if (de.valueDomain.permissibleValues.length !== valArray.length) {
                throw `PV length ${de.valueDomain.permissibleValues.length}, PV concepts Source length ${valArray.length}, mismatch. Must be the same length.` as any;
            }
            de.valueDomain.permissibleValues.forEach((pv, i) => {
                pv.conceptSource = trim(valArray[i]);
            });
        }
    },
    'Codes for Permissible Value': {
        order: 15,
        required: false,
        value: null,
        setValue: (de, v) => {
            const val = trim(v + '');
            if (!val) {
                return;
            }
            if (de.valueDomain?.datatype !== 'Value List') {
                throw `Type ${de.valueDomain?.datatype} should not have a Permissible Value Code` as any;
            }
            if (!de.valueDomain.permissibleValues) {
                throw `Permissible Values missing` as any;
            }
            const valArray = val.split('|');
            if (de.valueDomain.permissibleValues.length !== valArray.length) {
                throw `PV length ${de.valueDomain.permissibleValues.length}, PV Code length ${valArray.length}, mismatch. Must be the same length.` as any;
            }
            de.valueDomain.permissibleValues.forEach((pv, i) => {
                pv.valueMeaningCode = trim(valArray[i]);
            });
        }
    },
    'Permissible Value Code Systems': {
        order: 16,
        required: false,
        value: null,
        setValue: (de, v) => {
            const val = trim(v + '');
            if (!val) {
                return;
            }
            if (de.valueDomain?.datatype !== 'Value List') {
                throw `Type ${de.valueDomain?.datatype} should not have a Permissible Value Code System` as any;
            }
            if (!de.valueDomain.permissibleValues) {
                throw `Permissible Values missing` as any;
            }
            const valArray = val.split('|');
            if (valArray.length === 1) {
                valArray.length = de.valueDomain.permissibleValues.length;
                valArray.fill(valArray[0]);
            }
            if (de.valueDomain.permissibleValues.length !== valArray.length) {
                throw `PV length ${de.valueDomain.permissibleValues.length}, PV Code System length ${valArray.length}, mismatch. Must be the same length.` as any;
            }
            de.valueDomain.permissibleValues.forEach((pv, i) => {
                const codeSystem = trim(valArray[i]) as PermissibleValueCodeSystem;
                if (permissibleValueCodeSystems.includes(codeSystem)) {
                    pv.codeSystemName = codeSystem;
                } else {
                    throw `PV code system ${codeSystem} is not recognized` as any;
                }
            });
        }
    },
    References: {
        order: 17,
        required: false,
        value: null,
        setValue: (de, v) => {
            const val = trim(v + '');
            if (!val) {
                return;
            }
            de.referenceDocuments = val.split('|').map(s => ({text: trim(s)}));
        }
    },
    'Keywords/Tags': {
        order: 18,
        required: false,
        value: null,
        setValue: (de, v) => {
            const val = trim(v + '');
            if (!val) {
                return;
            }
            throw 'Keywords/Tags not implemented' as any;
        }
    }
};

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
        dataElements: []
    };
    const progress: VerifySubmissionFileProgress = {
        row: 0,
        rowTotal: 0,
        cde: 0,
        code: 0,
        codeTotal: 0
    };
    const {run} = schedulingExecutor(10, 100);
    let browserTimer: number = 0;
    let done: boolean = false;
    if (progressResponses) {
        progressResponses.on('data', r => {
            res = r;
        });
        function updateHandler() {
            if (done) {
                clearInterval(browserTimer);
                progress.report = {data, validationErrors};
            }
            if (res) {
                res.send(progress);
                res = null;
            }
        }
        updateHandler();
        browserTimer = setInterval(updateHandler, 5000) as any;
    }
    processSheetCover();
    return processSheetCDEs()
        .then(() => {
            done = true;
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

        expectFormTemplate(withError(row), rows[row++], {7: 'v.2023.03'});
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
            data.metadata.version = submissionVersion + '';
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

        try {
            getColumnPositions(rows[0]);
        } catch (err) {
            withError('COLUMN ERROR:')([err as string]);
            return !errors.length
        }
        expectFormTemplate(withError(1), rows[1], {0: 'Required', 1: 'Required'});
        if (!(rows[2][0] + '').startsWith('A unique and unambiguous label to help users')) {
            withError(2)(['Description Row is missing']);
            return !errors.length;
        }
        progress.row += 3;
        await mapSeries(rows.slice(3), (row, i) => nextTick().then(() => {
            progress.row++;
            const de = storeCdeData(withError(i), row);
            if (de) {
                progress.cde++;
                data.dataElements.push(de);
            }
        }));

        await Promise.all(data.dataElements.map(async cdeData => {
            if (!cdeData) {
                return;
            }
            await processIds(cdeData);
            if(cdeData.valueDomain?.datatype === 'Value List'){
                await processPVs(cdeData);
            }
        }));

        return !errors.length;
    }

    function processIds(dataElement: Partial<DataElement>) {
        // return Promise.all(dataElement.ids?.map(id => {
        //     if (id.source !== 'NLM' && id.id) {
        //         progress.codeTotal++;
        //         return run(() => umlsServerRequest(`/rest/content/current/CUI/${req.params.cui}`).then(data => {
        //             progress.code++
        //         }));
        //     }
        // }));
    }

    async function processPVs(dataElement: Partial<DataElement>) {

        // This would validate all at once but I think it returns after the first error so not all PVs will be checked
        // await validateAgainstUMLS(dataElement.valueDomain?.permissibleValues);

        // Alternative is to loop, but might end up taking too much time. We could also modify the validatePvs function
        // but need to be aware of where else in the application this is used
        if(dataElement.valueDomain?.permissibleValues){
            return Promise.all(dataElement.valueDomain?.permissibleValues.map(pv => {
                progress.codeTotal++;
                run(() => validateAgainstUMLS([pv]).then(data => {
                    progress.code++;
                    if(data){
                        const errorMsg = `${dataElement.tinyId} ${pv.codeSystemName} ${pv.valueMeaningCode} UMLS validation error: ${data}`;
                        validationErrors.CDEs.push(errorMsg);
                    }
                })).then();
            }));
        }
    }
}

function getColumnPositions(headerRow: Row) {
    headerRow.forEach((h, i) => {
        const heading = combineLines(h + '');
        const headingMatch = excelCdeColumns[heading];
        if (!headingMatch) {
            throw `Column:${heading}: not found` as any;
        }
        columnNumber[i] = headingMatch;
    })
}

function storeCdeData(withError: WithError, row: Row): Partial<DataElement> | null {
    if (row.length < 19) {
        withError([`Row length ${row.length} is less than the required 19 columns.`]);
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
            withError([`column ${i} is missing`]);
            return;
        }
        if (columnInformation.required && value === null) {
            withError([`Column ${i}: Required but no value provided`]);
        }
        columnInformation.value = value;
    });
    const de: Partial<DataElement> = {};
    excelCdeColumnsOrdered.forEach(columnInfo => {
        try {
            columnInfo.setValue(de, columnInfo.value)
        } catch (err) {
            withError([err as string]);
        }
    });
    return de;
}

function withErrorCapture(location: string, errors: string[]) {
    return (subLocation: string | number) => {
        return (errorSet: (string | undefined)[]) => {
            errorSet.forEach(err => {
                if (err) {
                    errors.push(location + ':' + subLocation + ':' + err);
                }
            });
        }
    }
}
