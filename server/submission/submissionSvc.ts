import { EventEmitter } from 'events';
import { Response } from 'express';
import {
    LoadData,
    ValidationErrors,
    VerifySubmissionFileProgress,
    VerifySubmissionFileReport
} from 'shared/boundaryInterfaces/API/submission';
import { keys } from 'shared/builtIn';
import { create as deCreate } from 'server/cde/mongo-cde';
import { CdeFormDocument, create as formCreate } from 'server/form/mongo-form';
import { DataElement } from 'shared/de/dataElement.model';
import { CdeForm, FormQuestion, QuestionValueList } from 'shared/form/form.model';
import { ArrayToType, Cb, Cb1, PermissibleValue, User } from 'shared/models.model';
import {
    cellValue,
    combineLines,
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
import { Submission } from 'shared/boundaryInterfaces/db/submissionDb';
import { DataElementDocument } from 'server/mongo/mongoose/dataElement.mongoose';
import { ColumnInformation, RowInformation, valueAsString } from 'server/submission/submissionShared';
import { cdeColumns as excelCdeColumns202309, cdeColumnsOrdered as excelCdeColumnsOrdered202309 } from 'server/submission/excel202309';

// Workbook Versions:
//     v.2023.09(LATEST): add 'Other Identifiers'
//     v.2023.04: same as v.2023.03 [MOVED TO v.2023.09]
//     v.2023.03(INITIAL VERSION) [MOVED TO v.2023.09]
// Additional Columns:
//     Property:
const workbookVersions = ['v.2023.03', 'v.2023.04', 'v.2023.09'] as const;
type WorkbookVersion = ArrayToType<typeof workbookVersions>;
const workbookVersionsStr = workbookVersions.join(', ');

function propertyColumnInformation(propertyName: string): ColumnInformation {
    return {
        order: -1,
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
            de.properties.push({key: propertyName, value: val})
        }
    };
}

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

export function processWorkBook(submission: Submission, wb: WorkBook, progressResponses?: EventEmitter):
    Promise<VerifySubmissionFileReport> {
    let res: Response | null = null;
    let workbookVersion: WorkbookVersion | '' = '';
    let cdeColumns: Record<string, ColumnInformation> = {};
    let cdeColumnsOrdered: ColumnInformation[] = [];
    const dictionary = spellChecker.getDictionarySync('en-US');
    const additionalColumnsOrdered: ColumnInformation[] = [];
    const columnNumber: ColumnInformation[]= [];
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

        workbookVersion = rows[row][7] as any || '';
        setColumnInformation(withError(row));
        expectFormTemplate(withError(row), rows[row++], {7: 'v.2023.09'},
            'Submission does not use the current submission template (version v.2023.09). No action is needed from you, but our team may contact you if additional information is required. The current version can always be found in the NLM Common Data Elements Team, in the General channel, under Files, in the CDE_Governance folder.');
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
            if (submission.name !== data.metadata.name) {
                errors.push(`Submission name "${submission.name}" does not match workbook title "${data.metadata.name}"`);
            }
        } else {
            errors.push('Submission name is required.');
        }

        if (submissionVersion && (typeof submissionVersion === 'number' || typeof submissionVersion === 'string')) {
            data.metadata.version = valueAsString(submissionVersion) || null;
            if (submission.version !== data.metadata.version) {
                errors.push(`Submission version "${submission.version}" does not match workbook version "${data.metadata.version}"`);
            }
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

        const columnErrors = getColumnPositions(rows[0], columnNumber, additionalColumnsOrdered);
        if (columnErrors.length) {
            columnErrors.forEach(message => withError(1)('Column Heading', message));
            return !errors.length;
        }

        expectFormTemplate(withError(2), rows[1], {0: 'Required'});

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
            const de = storeCdeData(withErrorRow, submission, row, info, columnNumber, additionalColumnsOrdered);
            if (de) {
                progress.cde++;
                data.dataElements.push(de);

                if (info.bundleName) {
                    bundle(submission, data.forms, info.bundleName, de);
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
            spellcheckDe(withError, de, dictionary);
        }

        await Promise.all(deProcessing);

        return !errors.length;
    }

    function getColumnPositions(headerRow: Row, columnNumber: ColumnInformation[],
                                additionalColumnsOrdered: ColumnInformation[]): string[] {
        const expectedColumns: string[] = [];
        const optionalColumns: string[] = [];
        keys(cdeColumns).forEach(column => {
            if (cdeColumns[column].required) {
                expectedColumns.push(column);
            } else {
                optionalColumns.push(column);
            }
        })
        const errors = headerRow.map((h, i) => {
            const heading = combineLines(valueAsString(h));
            let headingMatch = cdeColumns[heading];
            if (!headingMatch) {
                if (heading.startsWith('Property:')) {
                    const propertyName = heading.substring(9).trim();
                    headingMatch = propertyColumnInformation(propertyName);
                    additionalColumnsOrdered.push(headingMatch);
                } else {
                    return `Worksheet Column "${heading}" is incorrect. Please remove to continue.`;
                }
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

    function setColumnInformation(withError: WithError) {
        if (workbookVersion === 'v.2023.09' || workbookVersion === 'v.2023.03' || workbookVersion === 'v.2023.04') {
            cdeColumns = excelCdeColumns202309;
            cdeColumnsOrdered = excelCdeColumnsOrdered202309;
        } else {
            withError('Template', `Unknown Workbook version "${workbookVersion}". Recognized versions: ${workbookVersionsStr}`);
        }
    }

    function storeCdeData(withError: WithError, submission: Submission, row: Row, info: RowInformation, columnNumber: ColumnInformation[],
                          additionalColumnsOrdered: ColumnInformation[]): Partial<DataElement> | null {
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
        const de: Partial<DataElement> = {
            classification: [{stewardOrg: {name: submission.name},  elements: [{elements: [], name: submission.version}]}],
            dataElementConcept: {concepts: []},
            ids: [],
            nihEndorsed: true,
            objectClass: {concepts: []},
            property: {concepts: []},
            registrationState: {registrationStatus: submission.registrationStatus, administrativeStatus: submission.administrativeStatus},
            stewardOrg: {name: submission.name},
        };
        cdeColumnsOrdered.forEach(columnInfo => {
            columnInfo.setValue(withError, de, columnInfo.value, info);
        });
        additionalColumnsOrdered.forEach(columnInfo => {
            columnInfo.setValue(withError, de, columnInfo.value, info);
        });
        return de;
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

    function spellcheckDe(withError: WithError, dataElement: Partial<DataElement>, dictionary: any) {
        for (const field of spellCheckColumns) {
            let value = dataElement[field.prop as keyof DataElement];

            if(Array.isArray(value)){
                value = value.map((v) => {
                    let subProp = v;
                    if(field.subProps.length > 0){
                        field.subProps.forEach((sp) => {
                            if(subProp?.[sp]){
                                subProp = subProp[sp];
                            }
                        });
                    }
                    return subProp;
                }).join(' ');
            }

            if (value) {
                const terms = value.replace(/([\s*“”‘’'|—="!…:_.,;(){}–\-`?/\[\]]+)/g, '§sep§').split('§sep§');
                for (let term of terms) {
                    if (!/\d/.test(term) && term.toUpperCase() !== term) { // skip if contains number or in ALL CAPS
                        term = term.trim().toLowerCase();
                        if (!dictionary.spellCheck(term)) {
                            withError('Spellcheck', `"${term}" - check spelling of this word in "${field.prop}" property.`);
                        }
                    }
                }
            }
        }
    }
}

export async function publishItems(submission: Submission, report: VerifySubmissionFileReport, user: User) {
    const des = (await mapSeries(report.data.dataElements, (dataElement) => {
        if (!dataElement) {
            return Promise.resolve(null);
        }
        dataElement.created = new Date();
        dataElement.imported = new Date();
        // dataElement.partOfBundles is form names
        // TODO custom tinyId
        return new Promise((resolve, reject) => {
            deCreate(dataElement as DataElement, user, (err, de) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(de);
            });
        });
    })).filter(de => !!de) as DataElementDocument[];
    const forms = (await mapSeries(report.data.forms, (form) => {
        if (!form) {
            return Promise.resolve(null);
        }
        form.created = new Date();
        form.imported = new Date();
        form.formElements?.forEach(fe => {
            if (fe.elementType === 'question' && fe.label) {
                const deMatches = des.filter(de => de.designations[0].designation === fe.label);
                if (deMatches[0]) {
                    fe.question.cde.tinyId = deMatches[0].tinyId;
                }
            }
        });
        return new Promise((resolve, reject) => {
            formCreate(form as CdeForm, user, (err, f) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(f);
            });
        })
    })).filter(form => !!form) as CdeFormDocument[];
    await mapSeries<DataElementDocument, DataElementDocument | void>(des, de => {
        if (de.partOfBundles.length) {
            de.partOfBundles.forEach((name, i, bundles) => {
                const formMatches = forms.filter(f => f.designations[0].designation === name);
                if (formMatches[0]) {
                    bundles[i] = formMatches[0].tinyId;
                }
            });
            return de.save();
        }
        return Promise.resolve();
    });
}

function bundle(submission: Submission, forms: Partial<CdeForm>[], name: string, de: Partial<DataElement>) {
    if (!de.partOfBundles) {
        de.partOfBundles = [];
    }
    de.partOfBundles.push(name);

    let form = forms.find(form => form.designations?.[0].designation === name);
    if (!form) {
        form = {
            classification: [{stewardOrg: {name: submission.name},  elements: [{elements: [], name: submission.version}]}],
            definitions: [],
            designations: [{designation: name}],
            formElements: [],
            ids: [],
            isBundle: true,
            nihEndorsed: true,
            registrationState: {registrationStatus: submission.registrationStatus, administrativeStatus: submission.administrativeStatus},
            stewardOrg: {name: submission.name},
        };
        forms.push(form);
    }
    if (!form.formElements) {
        form.formElements = [];
    }

    const q = new FormQuestion();
    q.label = q.question.cde.name = de.designations?.[0] ? de.designations[0].designation : '';
    q.question.datatype = de.valueDomain?.datatype || 'Text';
    if (de.valueDomain?.datatype === 'Value List') {
        (q.question as QuestionValueList).answers = de.valueDomain.permissibleValues.concat([]);
    }

    form.formElements.push(q);
}

function withErrorCapture(location: string, errors: string[]) {
    return (subLocation: string | number): WithError =>
        (type, message) =>
            errors.push(location + ':' + subLocation + ':' + type + ':' + message);
}
