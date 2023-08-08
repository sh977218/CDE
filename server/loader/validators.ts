import {
    formatRows,
    getCell,
    parsePermissibleValueArray,
    parseValueDefinitionArray,
    parseConceptIdArray,
    parseCodeSystemName,
    parseColumn,
    REQUIRED_FIELDS,
    SPELL_CHECK_FIELDS,
    CSV_HEADER_MAP
} from 'shared/loader/utilities/utility';
import { DATA_TYPE_ARRAY } from 'shared/de/dataElement.model';
import {
    PermissibleValue,
    PermissibleValueCodeSystem,
    permissibleValueCodeSystems,
    ValidationWhitelist
} from 'shared/models.model';
import { validatePvs } from 'server/cde/utsValidate';
import * as XLSX from 'xlsx';
import * as spellChecker from 'simple-spellchecker';
import { validationWhitelistModel } from 'server/loader/schema';

const validConceptSystems = ['UMLS', 'NCI Thesaurus'];
const validCodeSystems = ['LOINC', 'SNOMEDCT_US'];

export function validatePermissibleValues(
    pvs: string[],
    valueDefs: string[],
    conceptIds: string[],
    conceptSource: string[],
    valueMeaningCodes: string[],
    codeSystem: string[]) {
    const output: string[] = [];

    if (pvs.length === 0) {
        output.push('Data type is: Value List but no Value Meaning Labels were provided.');
    }

    if (valueDefs.length === 0) {
        output.push('Data type is: Value List but no Value Meaning Definitions were provided.');
    }

    if (conceptIds.length === 0) {
        output.push('Data type is: Value List but no Value Meaning Terminology Concept Identifiers were provided.');
    }

    if (conceptSource.length === 0) {
        output.push('Data type is: Value List but no Permissible Value (PV) Terminology Sources were provided.');
    }

    conceptSource.forEach((v) => {
       if(!validConceptSystems.includes(v)){
            output.push(`Invalid concept system: ${v}`);
       }
    });

    if (valueMeaningCodes.length === 0) {
        output.push('Data type is: Value List but no Codes for Permissible Values were provided.');
    }

    if (codeSystem.length === 0) {
        output.push('Data type is: Value List but no Permissible Value Code Systems were provided.');
    }

    codeSystem.forEach((v) => {
        if(!validCodeSystems.includes(v)){
            output.push(`Invalid code system: ${v}`);
        }
    });

    if(!Array.from(arguments).every((v,i,arr) => v.length === arr[0].length)){
        output.push('Mismatch between amount of permissible values and amount of codes and/or value definitions');
    }

    return output;
}

export async function validateAgainstUMLS(pvs: PermissibleValue[]) {

    return validatePvs(pvs).then(
        () => {
            return '';
        },
        validationErrors => {
            return `Values failed UMLS Validation. Error: ${validationErrors}`;
        }
    );
}

export function validateURL(checkUrl: string) {
    let url;
    if (checkUrl.split(' ').length > 1) {
        return false;
    }
    try {
        url = new URL(checkUrl);
    } catch {
        return false;
    }
    return true;
}

function checkRequiredFields(row: Record<string, string>) {
    const output: string[] = [];
    for (const field of REQUIRED_FIELDS) {
        const data = getCell(row, field);
        if (!data) {
            output.push(`Required field '${CSV_HEADER_MAP[field] || field}' not provided`);
        }
    }
    return output;
}

export async function runValidationOnLoadCSV(csvFile: string) {
    const workbook = XLSX.read(csvFile);
    const workBookRows = XLSX.utils.sheet_to_json(workbook.Sheets.Sheet1);
    const fileErrors = [] as string[];
    const dataErrors = [] as {
        row: number,
        name: string,
        logs: string[]
    }[];
    let rowIdx = 6;

    const formattedRows = formatRows('UploadedFile', workBookRows, 4);

    if (!formattedRows || formattedRows.length === 0) {
        fileErrors.push('No data found to validate. Was this a valid CSV file?');
    } else {
        for (const row of formattedRows) {
            const currentLogs = [] as string[];
            currentLogs.push(...checkRequiredFields(row));
            const title = getCell(row, 'naming.designation');
            const datatype = getCell(row, 'datatypeValueList:datatype');
            const permissibleValueString = getCell(row, 'valueMeaningName');
            if (datatype !== 'Value List' && permissibleValueString) {
                currentLogs.push(`Data type is: '${datatype}' but permissible values were specified. Should this be a Value List type?`);
            }

            // Validate PVs
            if (datatype === 'Value List') {
                const pvArray = parseColumn(row, 'permissibleValues');
                const valueDefArray = parseColumn(row, 'permissibleValueDefs');

                const conceptIdArray = parseColumn(row, 'conceptIds');
                let conceptSource = parseColumn(row, 'conceptSource');

                if(conceptSource.length === 1) {
                    conceptSource = Array(pvArray.length).fill(conceptSource[0]);
                }
                conceptSource = conceptSource.map((v) => parseCodeSystemName(v));

                const valueMeaningCodeArray = parseColumn(row, 'permissibleValueCodes');
                let codeSystemName = parseColumn(row, 'codeSystem');

                if(codeSystemName.length === 1) {
                    codeSystemName = Array(pvArray.length).fill(codeSystemName[0]);
                }
                codeSystemName = codeSystemName.map((v) => parseCodeSystemName(v));

                currentLogs.push(...validatePermissibleValues(
                    pvArray,
                    valueDefArray,
                    conceptIdArray,
                    conceptSource,
                    valueMeaningCodeArray,
                    codeSystemName
                    )
                );

                const valueDomain = {
                    datatype: 'Value List',
                    uom: '',
                    permissibleValues: pvArray.map((value, i) => ({
                        permissibleValue: value,
                        valueMeaningDefinition: valueDefArray[i],
                        valueMeaningCode: valueMeaningCodeArray[i],
                        codeSystemName: codeSystemName[i],
                        conceptId: conceptIdArray[i],
                        conceptSource: conceptSource[i]
                    })) as PermissibleValue[]
                };

                const umlsErrors = await validateAgainstUMLS(valueDomain.permissibleValues);

                if (!!umlsErrors) {
                    currentLogs.push(umlsErrors);
                }
            }

            if (!DATA_TYPE_ARRAY.includes(datatype)) {
                currentLogs.push(`Data type '${datatype}' is not a recognized, valid CDE Data Type`);
            }

            if (currentLogs.length > 0) {
                dataErrors.push({row: rowIdx, name: title, logs: currentLogs});
            }
            rowIdx++
        }
    }
    return {fileErrors, dataErrors};
}

export async function spellcheckCSVLoad(whitelistName: string, csvFile: string) {
    const workbook = XLSX.read(csvFile);
    const workBookRows = XLSX.utils.sheet_to_json(workbook.Sheets.Sheet1);
    const fileErrors = [] as string[];
    const spellingErrors: Record<string, {
        row: number,
        name: string,
        error: string,
        field: string
    }[]> = {};
    let rowIdx = 6;

    const formattedRows = formatRows('UploadedFile', workBookRows, 4);

    if (!formattedRows || formattedRows.length === 0) {
        fileErrors.push('No data found to validate. Was this a valid CSV file?');
    } else {
        const dictionary = spellChecker.getDictionarySync('en-US');
        const whitelist = await validationWhitelistModel.findOne({collectionName: whitelistName});
        let whiteListTerms: string[];
        if (!whitelist) {
            whiteListTerms = [];
        } else {
            whiteListTerms = whitelist.terms;
        }
        for (const row of formattedRows) {
            const designation = getCell(row, 'naming.designation');

            for (const field of SPELL_CHECK_FIELDS) {
                const badValues = checkValue(row, field, dictionary, whiteListTerms);
                badValues.forEach(v => {
                    if (!!spellingErrors[v]) {
                        spellingErrors[v].push({
                            row: rowIdx,
                            name: designation,
                            error: getCell(row, field),
                            field: CSV_HEADER_MAP[field] || field
                        });
                    } else {
                        spellingErrors[v] = [{
                            row: rowIdx,
                            name: designation,
                            error: getCell(row, field),
                            field: CSV_HEADER_MAP[field] || field
                        }];
                    }
                });
            }
            rowIdx++
        }
    }
    return {fileErrors, spellingErrors};
}

function checkValue(row: Record<string, string>, header: string, dictionary: any, whitelist: string[]) {
    const errors: string[] = [];
    const value = getCell(row, header);

    if (!!value) {
        const terms = value.replace(/([ \n*'|—="!…:_.,;(){}–\-`?/\[\]]+)/g, '§sep§').split('§sep§');
        for (let term of terms) {
            if (!/\d/.test(term) && term.toUpperCase() !== term) {
                term = term.trim().toLowerCase();
                const misspelled = !dictionary.spellCheck(term);
                if (misspelled && !whitelist.includes(term)) {
                    errors.push(term);
                }
            }
        }
    }

    return errors;
}

export async function getValidationWhitelists() {
    return validationWhitelistModel.find({}).lean();
}

export async function deleteValidationWhitelist(name: string) {
    return validationWhitelistModel.deleteOne({collectionName: name});
}

export async function addValidationWhitelist(whiteList: ValidationWhitelist) {
    new validationWhitelistModel(whiteList).save();
}

export async function updateValidationWhitelist(whiteList: ValidationWhitelist) {
    return validationWhitelistModel.findOneAndUpdate(
        {collectionName: whiteList.collectionName},
        {
            $set: {
                terms: whiteList.terms
            }
        },
        {
            new: true
        });
}
