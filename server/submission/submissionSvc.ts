import { QueryDslQueryContainer } from '@elastic/elasticsearch/api/types';
import { EventEmitter } from 'events';
import { Response } from 'express';
import { intersection } from 'lodash';
import { config, dbPlugins } from 'server';
import { elasticsearch } from 'server/cde/elastic';
import {
    byTinyId as deByTinyId,
    create as deCreate,
    dataElementSourceModel,
    update as deUpdate,
} from 'server/cde/mongo-cde';
import {
    CdeFormDocument,
    byTinyId as formByTinyId,
    create as formCreate,
    formSourceModel,
    update as formUpdate
} from 'server/form/mongo-form';
import { DataElementDocument } from 'server/mongo/mongoose/dataElement.mongoose';
import {
    cdeColumns as excelCdeColumns202404,
    cdeColumnsOrdered as excelCdeColumnsOrdered202404,
} from 'server/submission/excel202404';
import { ColumnInformation, RowInformation, valueAsString } from 'server/submission/submissionShared';
import { esClient, termRegStatus } from 'server/system/elastic';
import { CDE_SYSTEM_TO_UMLS_SYSTEM_MAP, searchBySystemAndCode } from 'server/uts/utsSvc';
import { push3 } from 'shared/array';
import {
    LoadData,
    ValidationErrors,
    VerifySubmissionFileProgress,
    VerifySubmissionFileReport,
} from 'shared/boundaryInterfaces/API/submission';
import { Submission } from 'shared/boundaryInterfaces/db/submissionDb';
import { keys } from 'shared/builtIn';
import { DataElement, DataElementElastic, mergeDataElement, ValueDomainValueList } from 'shared/de/dataElement.model';
import { esqBool, esqBoolMustNot, esqTerm } from 'shared/elastic';
import { convertCdeToQuestion, getOwnQuestions } from 'shared/form/fe';
import { CdeForm } from 'shared/form/form.model';
import { isDataElement, Item } from 'shared/item';
import { ArrayToType, Cb, Cb1, Elt, PermissibleValue, User } from 'shared/models.model';
import {
    cellValue,
    combineLines,
    expectFormTemplate,
    extractFormValue,
    Row,
    trim,
    WithError,
} from 'shared/node/io/excel';
import { nextTick } from 'shared/node/nodeUtil';
import { mapSeries } from 'shared/promise';
import { schedulingExecutor } from 'shared/scheduling';
import { SearchSettingsElastic } from 'shared/search/search.model';
import { isT, noop } from 'shared/util';
import * as spellChecker from 'simple-spellchecker';
import { utils, WorkBook } from 'xlsx';

// Workbook Versions:
//     v.2024.04(LATEST): add version on most tabs
//     v.2024.01: add 'URI/URL' [MOVED TO v.2024.01]
//     v.2023.09: add 'Other Identifiers' [MOVED TO v.2024.01]
//     v.2023.04: same as v.2023.03 [MOVED TO v.2024.01]
//     v.2023.03(INITIAL VERSION) [MOVED TO v.2024.01]
// Additional Columns:
//     Property:
//     [#]
const workbookVersions = ['v.2023.03', 'v.2023.04', 'v.2023.09', 'v.2024.01', 'v.2024.04'] as const;
type WorkbookVersion = ArrayToType<typeof workbookVersions>;
const workbookVersionsStr = workbookVersions.join(', ');
const BUNDLE_TOKEN = 'New Bundle: ';
const BUNDLE_TOKEN_LENGTH = 12;

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
            de.properties.push({ key: propertyName, value: val });
        },
    };
}

const spellCheckColumns = [
    {
        prop: 'designations',
        subProps: ['designation'],
    },
    {
        prop: 'definitions',
        subProps: ['definition'],
    },
];

export function processWorkBook(
    submission: Submission,
    wb: WorkBook,
    progressResponses?: EventEmitter
): Promise<VerifySubmissionFileReport> {
    let res: Response | null = null;
    let workbookVersion: WorkbookVersion | '' = '';
    let cdeColumns: Record<string, ColumnInformation> = {};
    let cdeColumnsOrdered: ColumnInformation[] = [];
    const dictionary = spellChecker.getDictionarySync('en-US');
    const additionalColumnsOrdered: ColumnInformation[] = [];
    const columnNumber: ColumnInformation[] = [];
    const splitColumns: ColumnInformation[][] = [];
    const splitColumnHeadings: Record<string, number> = {};
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
    const existingBundles: Record<string, string[][]> = {};
    const progress: VerifySubmissionFileProgress = {
        row: 0,
        rowTotal: 0,
        cde: 0,
        code: 0,
        codeTotal: 0,
    };
    const { run: execute } = schedulingExecutor(100, 0); // limit total server resources used
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
                progress.report = { data, validationErrors };
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
        };
        nextTick().then(updateHandler);
        browserTimer = setInterval(updateHandler, 5000) as any;
    }
    processSheetCover();
    return processSheetCDEs()
        .then(postDataProcessing)
        .then(async () => {
            if (updateHandler) {
                await updateHandler(true);
            }
            return { data, validationErrors };
        });

    function processSheetCover(): boolean {
        const errors = validationErrors.cover;
        const withError = withErrorCapture('Cover Sheet', errors);
        const coverSheet = wb.Sheets['Cover Sheet'];
        if (!coverSheet) {
            withError(0)('Template', 'Worksheet "Cover Sheet" is missing.');
            return false;
        }
        const rows = utils.sheet_to_json<(string | null)[]>(coverSheet, { header: 1, defval: null });
        let row = 0;

        workbookVersion = (rows[row][7] as any) || '';
        setColumnInformation(withError(row));
        expectFormTemplate(
            withError(row),
            rows[row++],
            { 7: 'v.2024.01' },
            'Submission does not use the current submission template (version v.2024.01). No action is needed from you, but our team may contact you if additional information is required. The current version can always be found in the NLM Common Data Elements Team, in the General channel, under Files, in the CDE_Governance folder.'
        );
        expectFormTemplate(withError(row), rows[row++], { 1: 'CDE Governance Submission Cover Sheet' });
        row++;
        row++;
        expectFormTemplate(withError(row), rows[row++], { 1: 'Submission Information' });
        const submissionName = extractFormValue(withError(row), rows[row++], 2, 9, { 1: '*Submission title:' });
        row++;
        const submissionUrl = extractFormValue(withError(row), rows[row++], 2, 9, { 1: 'Submission URL:' });
        row++;
        const submissionVersion = extractFormValue(withError(row), rows[row], 2, 9, { 1: '*Version number:' });
        const numberCDEs = extractFormValue(withError(row), rows[row++], 7, 9, {
            5: 'Number of CDEs in this submission:',
        });
        row++;
        row++;
        row++;
        row++;
        const submissionDescription = extractFormValue(withError(row), rows[row++], 2, 9, {
            1: '*Submission description:',
        });
        // checkbox doesn't work, fields are a repeat from submission anyway

        if (submissionName && typeof submissionName === 'string') {
            data.metadata.name = submissionName;
            if (submission.name !== data.metadata.name) {
                withError(4)(
                    'Code',
                    `Submission name "${submission.name}" does not match workbook title "${data.metadata.name}"`
                );
            }
        } else {
            withError(4)('Required', 'Submission name is required.');
        }

        if (submissionVersion && (typeof submissionVersion === 'number' || typeof submissionVersion === 'string')) {
            data.metadata.version = valueAsString(submissionVersion) || null;
            if (submission.version !== data.metadata.version) {
                withError(6)(
                    'Code',
                    `Submission version "${submission.version}" does not match workbook version "${data.metadata.version}"`
                );
            }
        } else {
            withError(6)('Required', 'Submission version is required.');
        }

        return !errors.length;
    }

    async function processSheetCDEs(): Promise<boolean> {
        const errors = validationErrors.CDEs;
        const withError = withErrorCapture('CDEs sheet', errors);
        const cdesSheet = wb.Sheets.CDEs;
        if (!cdesSheet) {
            withError(0)('Template', 'Worksheet "CDEs" is missing.');
            return false;
        }
        const rows = utils.sheet_to_json<Row>(cdesSheet, { header: 1, defval: null });
        progress.rowTotal += rows.length;

        const columnErrors = getColumnPositions(withError(1), rows[0], columnNumber, additionalColumnsOrdered);
        if (columnErrors.length) {
            columnErrors.forEach(message => withError(1)('Column Heading', message));
            return !errors.length;
        }

        expectFormTemplate(withError(2), rows[1], { 0: 'Required' });

        if (!valueAsString(rows[2][0]).startsWith('A unique and unambiguous label to help users')) {
            withError(3)('Template', 'Description Row is missing.');
            return !errors.length;
        }

        progress.row += 3;
        const deProcessing: Promise<void>[] = [];
        const labelsMap: Record<string, number[]> = {};
        await mapSeries(rows.slice(3), (row, i) =>
            nextTick().then(() => {
                // sync processing one at a time
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

                    rawSource(de, submission);

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
            })
        );
        Object.keys(labelsMap).forEach(label => {
            const m = labelsMap[label];
            if (m.length > 1) {
                withError('(' + m.join(', ') + ')')(
                    'Suggestion',
                    'In most cases, Preferred Question Text should be unique. Duplicates were found.'
                );
            }
        });

        async function processDe(withError: WithError, de: Partial<DataElement>) {
            // process de synchronously because the parent call is asynchronous
            if (!de) {
                return;
            }
            // await findDuplicatedCdeInEsUsingMoreLikeThis(withError, de);
            await findDuplicatedCdeInEsUsingPlainSearch(withError, de);
            await processIds(withError, de);
            await processPVs(withError, de);
            spellcheckDe(withError, de, dictionary);
            await validateReuseByTinyid(withError, de);
        }

        await Promise.all(deProcessing);

        return !errors.length;
    }

    async function postDataProcessing() {
        await reuseBundles();
    }

    function getSplitColumnIndex(heading: string) {
        if (splitColumnHeadings[heading] === undefined) {
            const newIndex = splitColumns.length;
            splitColumnHeadings[heading] = newIndex;
            splitColumns[newIndex] = [];
        }
        return splitColumnHeadings[heading];
    }

    function getColumnPositions(
        withError: WithError,
        headerRow: Row,
        columnNumber: ColumnInformation[],
        additionalColumnsOrdered: ColumnInformation[]
    ): string[] {
        const expectedColumns: string[] = [];
        const optionalColumns: string[] = [];
        keys(cdeColumns).forEach(column => {
            if (cdeColumns[column].required) {
                expectedColumns.push(column);
            } else {
                optionalColumns.push(column);
            }
        });
        const tabWithIndex = new RegExp(/^\[(\d)\]\s*(.*)$/);
        const errors = headerRow
            .map((h, i) => {
                const heading = combineLines(valueAsString(h));
                let headingMatch = cdeColumns[heading];
                if (!headingMatch) {
                    if (heading.startsWith('Property:')) {
                        const propertyName = heading.substring(9).trim();
                        headingMatch = propertyColumnInformation(propertyName);
                        additionalColumnsOrdered.push(headingMatch);
                    } else {
                        const indexMatch = tabWithIndex.exec(heading);
                        if (indexMatch) {
                            const baseHeading = indexMatch[2];
                            const indexFromHeading = parseInt(indexMatch[1], 10) - 1;
                            headingMatch = {
                                order: -1,
                                required: false,
                                value: null,
                                setValue: () => {},
                            };
                            splitColumns[getSplitColumnIndex(baseHeading)][indexFromHeading] = headingMatch;
                        } else {
                            return `Worksheet Column "${heading}" is incorrect. Please remove to continue.`;
                        }
                    }
                } else {
                    splitColumns[getSplitColumnIndex(heading)][0] = headingMatch;
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
            .filter(isT)
            .concat(
                expectedColumns.map(
                    columnHeading =>
                        `Required Column "${columnHeading}" was not found in the worksheet. Add this column to continue.`
                )
            );
        Object.keys(splitColumnHeadings).forEach(key => {
            const splitColumn = splitColumns[splitColumnHeadings[key]];
            if (!splitColumn[0]) {
                withError('Template', key + ': The column without an index is missing');
            }
            let index = 0;
            splitColumn.forEach((colInfo, i) => {
                if (index !== i) {
                    withError(
                        'Template',
                        key +
                            `: Indexed Column ${index + 1} is missing while following indexed column ${
                                i + 1
                            } has been used.`
                    );
                }
                if (colInfo) {
                    index++;
                }
            });
        });
        return errors.length
            ? errors.concat(
                  optionalColumns.map(
                      columnHeading => `Optional Column "${columnHeading}" not used yet in the worksheet. This is okay.`
                  )
              )
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
        if (['v.2024.01', 'v.2023.09', 'v.2023.03', 'v.2023.04'].includes(workbookVersion)) {
            // NOOP
        } else {
            withError(
                'Template',
                `Unknown Workbook version "${workbookVersion}". Recognized versions: ${workbookVersionsStr}`
            );
        }
        // default to latest
        cdeColumns = excelCdeColumns202404;
        cdeColumnsOrdered = excelCdeColumnsOrdered202404;
    }

    function storeCdeData(
        withError: WithError,
        submission: Submission,
        row: Row,
        info: RowInformation,
        columnNumber: ColumnInformation[],
        additionalColumnsOrdered: ColumnInformation[]
    ): DataElement | null {
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
            const value = cellValue(withError, cell);
            const columnInformation = columnNumber[i];
            if (!columnInformation) {
                withError('Template', `column ${i} is missing.`);
                return;
            }
            if (columnInformation.required && value === null) {
                withError('Required', `Column ${i}: Required but no value provided.`);
            }
            columnInformation.value = value;
        });
        splitColumns.forEach(split => {
            split.forEach((colInfo, index, split) => {
                if (index === 0) {
                    return;
                }
                split[0].value = (split[0]?.value ?? '') + '' + (colInfo.value ?? '');
            });
        });
        const de: DataElement = new DataElement();
        eltCommon(de, submission);
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
            validateCode(withError, pv.conceptSource, pv.conceptId, null),
        ]).then(noop, noop);
    }

    function validateCode(withError: WithError, system?: string, code?: string, name?: string | null): Promise<void> {
        if (!system || !code) {
            return Promise.resolve();
        }

        const umlsSystems = (system ? system.split(/[,:]/) : [])
            .map(s => s && CDE_SYSTEM_TO_UMLS_SYSTEM_MAP[trim(s)])
            .filter(s => s);
        const umlsCodes = (code ? code.split(/[,:]/) : []).map(c => trim(c)).filter(c => c);
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
                return execute(() =>
                    searchBySystemAndCode(umlsSystems[i] || umlsSystems[0], trim(c)).then(
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
                        }
                    )
                );
            })
        ).then(
            results => {
                function match(results: string[][], name: string): boolean {
                    if (results.length === 0) {
                        return false;
                    }
                    return results[0]
                        .filter(n => name.startsWith(n.toLowerCase()))
                        .some(n => {
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
                    withError(
                        'Code',
                        `UMLS validation for ${system}/${code} "${results.join()}" does not match "${name}".`
                    );
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

            if (Array.isArray(value)) {
                value = value
                    .map(v => {
                        let subProp = v;
                        if (field.subProps.length > 0) {
                            field.subProps.forEach(sp => {
                                if (subProp?.[sp]) {
                                    subProp = subProp[sp];
                                }
                            });
                        }
                        return subProp;
                    })
                    .join(' ');
            }

            if (value) {
                const terms = value.replace(/([\s*“”’|—="!…:_.,;(){}–\-`?/\[\]]+)/g, '§sep§').split('§sep§');
                for (let term of terms) {
                    if (!/\d/.test(term) && term.toUpperCase() !== term) {
                        // skip if contains number or in ALL CAPS
                        term = term.trim().toLowerCase();
                        if (!dictionary.spellCheck(term)) {
                            withError(
                                'Spellcheck',
                                `"${term}" - check spelling of this word in "${field.prop}" property.`
                            );
                        }
                    }
                }
            }
        }
    }

    async function validateReuseByTinyid(withError: WithError, dataElement: Partial<DataElement>) {
        if (!dataElement.tinyId) {
            return;
        }

        const existingDe = await deByTinyId(dataElement.tinyId);
        if (!existingDe) {
            withError('Reuse', `Data element ${dataElement.tinyId} does not exist`);
            return;
        }
        if (!existingDe.nihEndorsed) {
            withError('Reuse', `Data element ${dataElement.tinyId} is not endorsed. Must be endorsed to reuse.`);
            return;
        }

        const existingPreferredDesignation = existingDe.designations.filter(designation =>
            designation.tags.includes('Preferred Question Text')
        )[0];
        const submittedPreferredDesignation = dataElement.designations?.filter(designation =>
            designation.tags.includes('Preferred Question Text')
        )[0];
        const existingPf = existingPreferredDesignation?.designation?.trim();
        const newPf = submittedPreferredDesignation?.designation?.trim();
        if (existingPf && newPf && existingPf != newPf) {
            withError(
                'Reuse',
                `${dataElement.tinyId}: New preferred designation "${newPf}" does not match existing "${existingPf}"`
            );
        }

        if (existingDe.valueDomain.datatype !== dataElement.valueDomain?.datatype) {
            withError(
                'Reuse',
                `${dataElement.tinyId}: New datatype "${dataElement.valueDomain?.datatype}" does not match existing "${existingDe.valueDomain.datatype}"`
            );
        }
        if (existingDe.valueDomain.datatype === 'Value List') {
            const pvs = existingDe.valueDomain.permissibleValues.concat();
            (dataElement.valueDomain as ValueDomainValueList).permissibleValues.forEach(newPv => {
                const matchPv = pvs.filter(
                    pv =>
                        pv.permissibleValue === newPv.permissibleValue &&
                        (!pv.valueMeaningName ||
                            !newPv.valueMeaningName ||
                            pv.valueMeaningName === newPv.valueMeaningName) &&
                        (!pv.valueMeaningCode ||
                            !newPv.valueMeaningCode ||
                            pv.valueMeaningCode === newPv.valueMeaningCode) &&
                        (!pv.codeSystemName || !newPv.codeSystemName || pv.codeSystemName === newPv.codeSystemName) &&
                        (!pv.conceptId ||
                            !newPv.conceptId ||
                            (pv.conceptId === newPv.conceptId && pv.conceptSource === newPv.conceptSource))
                )[0];
                if (matchPv) {
                    pvs.splice(pvs.indexOf(matchPv), 1);
                } else {
                    withError(
                        'Reuse',
                        `${dataElement.tinyId}: New Permissible Value "${newPv.permissibleValue}" not found in existing`
                    );
                }
            });
            pvs.forEach(pv => {
                withError(
                    'Reuse',
                    `${dataElement.tinyId}: Existing Permissible Value "${pv.permissibleValue}" not found in submission`
                );
            });
        }
        // TODO: validate more datatype options

        if (!existingDe.partOfBundles.length && dataElement.partOfBundles?.length) {
            withError('Reuse', `${dataElement.tinyId}: Cannot reuse a not-bundled data element for a bundle`);
        }
        if (existingDe.partOfBundles.length && !dataElement.partOfBundles?.length) {
            withError('Reuse', `${dataElement.tinyId}: Cannot reuse a bundled data element without a bundle`);
        }
        if (dataElement.partOfBundles?.length) {
            let bundleName = '';
            dataElement.partOfBundles.forEach(part => {
                if (part.startsWith(BUNDLE_TOKEN)) {
                    bundleName = part.substring(BUNDLE_TOKEN_LENGTH);
                }
            });
            if (bundleName) {
                if (!existingBundles[bundleName]) {
                    existingBundles[bundleName] = [];
                }
                existingBundles[bundleName].push(existingDe.partOfBundles);
            }
        }

        if (dataElement.dataElementConcept?.concepts?.length) {
            const existingConcepts = existingDe.dataElementConcept?.concepts || [];
            dataElement.dataElementConcept.concepts.forEach(c => {
                const sameOriginMatches = existingConcepts.filter(e => e.origin === c.origin);
                if (sameOriginMatches && !sameOriginMatches.filter(e => e.originId === c.originId).length) {
                    withError(
                        'Reuse',
                        `${dataElement.tinyId}: No match for submission concept ${c.origin}:${c.originId}`
                    );
                }
            });
        }

        if (
            dataElement.valueDomain?.uom &&
            existingDe.valueDomain.uom &&
            dataElement.valueDomain.uom !== existingDe.valueDomain.uom
        ) {
            withError(
                'Reuse',
                `${dataElement.tinyId}: Submitted unit of measure "${dataElement.valueDomain.uom}" does not match existing "${existingDe.valueDomain.uom}"`
            );
        }
        // TODO: match unit of measure family
    }

    function reuseBundles() {
        const bundleNames = Object.keys(existingBundles);
        return Promise.all(bundleNames.map(name => {
            const possibleForms = intersection(...existingBundles[name]);
            return Promise.all(possibleForms.map(tinyId =>
                dbPlugins.form
                    .byTinyId(tinyId)
                    .then(form => {
                        if (!form?.designations.filter(d => d.designation === name).length
                            || getOwnQuestions(form.formElements).length > existingBundles[name].length) { // silent filters, hard to trace
                            return;
                        }
                        data.forms
                            .filter(form => form.designations[0].designation === name)
                            .map(form => (form.tinyId = tinyId)); // mark new form to not save, reused
                    })
            ));
        }));
    }
}

export async function publishItems(submission: Submission, report: VerifySubmissionFileReport, user: User) {
    const des: DataElementDocument[] = (
        await mapSeries(report.data.dataElements, dataElement => {
            if (!dataElement) {
                return Promise.resolve(null);
            }
            if (dataElement.tinyId) {
                // merge into existing
                return deByTinyId(dataElement.tinyId).then(existingDe => {
                    if (!existingDe) {
                        throw `de ${dataElement.tinyId} does not exist after validation`;
                    }
                    mergeDataElement(dataElement, existingDe);
                    return deUpdate(existingDe, user);
                });
            } else {
                dataElement.imported = new Date();
                // dataElement.partOfBundles is form names
                return deCreate(dataElement as DataElement, user).then(de =>
                    deSourceCreate(de.toObject(), submission.name).then(() => de)
                );
            }
        })
    ).filter(isT);
    const createdForms: CdeFormDocument[] = (
        await mapSeries(report.data.forms, form => {
            if (!form) {
                return Promise.resolve(null);
            }
            if (form.tinyId) {
                return formByTinyId(form.tinyId).then(existingForm => {
                   if (!existingForm) {
                       throw `form ${form.tinyId} does not exist after validation`;
                   }
                   updateFormForSubmission(form, existingForm);
                   return formUpdate(existingForm, user);
                });
            } else {
                form.formElements?.forEach(fe => {
                    if (fe.elementType === 'question' && fe.label) {
                        const deMatches = des.filter(de => de.designations[0].designation === fe.label);
                        if (deMatches[0]) {
                            fe.question.cde.tinyId = deMatches[0].tinyId;
                        }
                    }
                });
                form.imported = Date.now();
                return formCreate(form as CdeForm, user).then(f =>
                    formSourceCreate(f.toObject(), submission.name).then(() => f)
                );
            }
        })
    ).filter(isT);
    await mapSeries<DataElementDocument, DataElementDocument | void>(des, de => {
        return de.partOfBundles.some((nameToken, i, deBundles) => {
            if (!nameToken.startsWith(BUNDLE_TOKEN)) {
                return false;
            }
            const name = nameToken.substring(BUNDLE_TOKEN_LENGTH);
            const formMatch = createdForms.filter(f => f.designations[0].designation === name)[0];
            if (!formMatch) {
                return false;
            }
            deBundles[i] = formMatch.tinyId;
            return true;
        }) ? de.save() : Promise.resolve();
    });
}

function bundle(submission: Submission, forms: CdeForm[], name: string, de: DataElement) {
    if (!de.partOfBundles) {
        de.partOfBundles = [];
    }
    de.partOfBundles.push(BUNDLE_TOKEN + name);

    let form = forms.find(form => form.designations?.[0].designation === name);
    if (!form) {
        form = new CdeForm();
        eltCommon(form, submission);
        form.isBundle = true;
        form.copyright = { text: submissionCopyright(submission), urls: [] };
        if (form.copyright.text?.substring((form.copyright.text?.indexOf('Free -- Publicly Available') + 1) * 26)) {
            // 26 is length of string
            form.isCopyrighted = true;
        }
        form.designations.push({ designation: name, tags: [], sources: [] });
        form.definitions.push({ definition: 'This is a bundle.', tags: [], sources: [] });
        forms.push(form);
    }
    if (!form.formElements) {
        form.formElements = [];
    }

    const q = convertCdeToQuestion(de);
    if (q) {
        form.formElements.push(q);
    }
}

function eltClassify(elt: Elt, name: string) {
    elt.classification.push({
        stewardOrg: { name: name },
        elements: [{ elements: [], name: name }],
    });
}

function eltCommon(elt: Elt, submission: Submission) {
    elt.nihEndorsed = true;
    elt.stewardOrg.name = submission.name;
    elt.registrationState.registrationStatus = submission.registrationStatus;
    elt.registrationState.administrativeStatus = submission.administrativeStatus;
    eltClassify(elt, submission.name);
}

function updateFormForSubmission(formTemplate: CdeForm, existingForm: CdeForm) {
    eltClassify(existingForm, formTemplate.stewardOrg.name)
}

function withErrorCapture(location: string, errors: string[]) {
    return (subLocation: string | number): WithError =>
        (type, message) =>
            errors.push(location + ':' + subLocation + ':' + type + ':' + message);
}

function findDuplicatedCdeInEsUsingMoreLikeThis(withError: WithError, cde: Partial<DataElement>): Promise<boolean> {
    return new Promise((resolve, reject) => {
        const boolMust: QueryDslQueryContainer[] = [esqTerm('nihEndorsed', true)];

        (cde.designations || []).forEach(d => {
            boolMust.push({
                more_like_this: {
                    fields: ['designations.designation'],
                    like: d.designation,
                    min_term_freq: 1,
                    min_doc_freq: 1,
                },
            });
        });

        if (cde.valueDomain?.datatype === 'Value List') {
            boolMust.push(esqTerm('valueDomain.datatype', 'Value List'));
            boolMust.push({
                script: {
                    script: {
                        source:
                            "doc['valueDomain.permissibleValues.permissibleValue'].length == " +
                            (cde.valueDomain?.permissibleValues.length || 0),
                        lang: 'painless',
                    },
                },
            });
        } else {
            boolMust.push(esqTerm('valueDomain.datatype', cde.valueDomain!.datatype));
        }
        const queryBody = {
            index: config.elastic.index.name,
            body: {
                query: esqBool(null, boolMust, esqBoolMustNot(termRegStatus('Retired'))),
            },
        };
        esClient.search<DataElementElastic>(queryBody).then(result => {
            result.body.hits.hits.forEach((hit: any) => {
                withError(
                    'Duplicated CDEs',
                    `'${(cde.designations || [])[0]?.designation}' matched tinyId: '${hit._id}' '${
                        hit._source.primaryNameCopy
                    }'`
                );
            });
            resolve(true);
        }, reject);
    });
}

function findDuplicatedCdeInEsUsingPlainSearch(withError: WithError, cde: Partial<DataElement>): Promise<boolean> {
    return new Promise((resolve, reject) => {
        const designation = (cde.designations || [])[0]?.designation;
        const searchSetting: SearchSettingsElastic = {
            nihEndorsed: true,
            excludeOrgs: [],
            meshTree: '',
            resultPerPage: 20,
            selectedAdminStatuses: [],
            selectedDatatypes: [],
            selectedCopyrightStatus: [],
            selectedStatuses: [],
            selectedElements: [],
            selectedElementsAlt: [],
            searchTerm: `designations.designation: ${designation} AND valueDomain.datatype: ${cde.valueDomain?.datatype}`,
        };
        if (cde.valueDomain?.datatype === 'Value List') {
            searchSetting.searchTerm += ` AND valueDomain.nbOfPVs: ${cde.valueDomain?.permissibleValues.length}`;
        }
        const nlmUser: User = {
            _id: '',
            orgAdmin: [],
            orgCurator: [],
            orgEditor: [],
            siteAdmin: true,
            username: 'root_user',
        };
        elasticsearch(nlmUser, searchSetting, (err: any, result: any) => {
            if (err) {
                reject(err);
            } else {
                result.cdes.slice(0, 2).forEach((cde: any) => {
                    withError(
                        'Duplicated CDEs',
                        `'<strong>${designation}</strong>' matched tinyId: <a href="/deView?tinyId=${cde.tinyId}" target="_blank">${cde.tinyId}</a> '<strong>${cde.primaryNameCopy}</strong>'`
                    );
                });
                resolve(true);
            }
        });
    });
}

function deSourceCreate(de: DataElement, source: string) {
    const sourceDoc = new dataElementSourceModel(de);
    sourceDoc.source = source;
    return sourceDoc.save();
}

function formSourceCreate(form: CdeForm, source: string) {
    const sourceDoc = new formSourceModel(form);
    sourceDoc.source = source;
    return sourceDoc.save();
}

function rawSource(item: Item, submission: Submission) {
    if (!item.sources) {
        item.sources = [];
    }
    const existingSources = item.sources.filter(s => s.sourceName === submission.name);
    const rawSource = existingSources[0] || push3(item.sources, { sourceName: submission.name });
    rawSource.imported = new Date();
    rawSource.copyright = { value: submissionCopyright(submission) };
    if (isDataElement(item)) {
        rawSource.datatype = item.valueDomain.datatype;
    }
    rawSource.administrativeStatus = item.registrationState.administrativeStatus;
    rawSource.registrationStatus = item.registrationState.registrationStatus;
}

function submissionCopyright(submission: Submission): string {
    let copyrightText = '';
    if (submission.licensePublic) {
        copyrightText += 'Free -- Publicly Available';
    }
    if (submission.licenseAttribution) {
        copyrightText += (copyrightText ? ', ' : '') + 'Free -- Attribution Required';
    }
    if (submission.licensePermission) {
        copyrightText += (copyrightText ? ', ' : '') + 'Free -- Permission Required';
    }
    if (submission.licenseCost) {
        copyrightText += (copyrightText ? ', ' : '') + 'Proprietary -- Cost/Purchase Required';
    }
    if (submission.licenseTraining) {
        copyrightText += (copyrightText ? ', ' : '') + 'Proprietary -- Training Required';
    }
    if (submission.licenseOther) {
        copyrightText += (copyrightText ? ', ' : '') + 'Other';
    }
    if (submission.licenseInformation) {
        copyrightText += (copyrightText ? ', ' : '') + submission.licenseInformation;
    }
    return copyrightText;
}
