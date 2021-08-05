import {
    formatRows,
    getCell,
    parsePermissibleValueArray,
    parseValueDefinitionArray,
    parseValueMeaningCodeArray,
    parseCodeSystemName
} from 'shared/loader/utilities/utility';
import { PermissibleValue, PermissibleValueCodeSystem } from 'shared/models.model';
import { validatePvs } from 'server/cde/utsValidate';
import * as XLSX from 'xlsx';

export function validatePermissibleValues(pvs: string[], valueDefs: string[], valueCodes: string[], name: string) {
    let output = '';

    if (valueDefs.length !== pvs.length || valueCodes.length !== pvs.length) {
        output += 'Mismatch between amount of permissible values and amount of codes and/or value definitions\n';
    }

    for (const i in valueDefs) {
        if (valueDefs[i].split(':')[0].trim() !== pvs[i]) {
            output += `Value Def: '${valueDefs[i]}' does not match Permissible Value: '${pvs[i]}'\n`;
        }
    }

    return output;
}

export async function validateAgainstUMLS(pvs: PermissibleValue[], name: string) {

    return validatePvs(pvs).then(
        () => {
            return '';
        },
        validationErrors => {
            return `Values failed UMLS Validation for CDE: ${name}. Error: ${validationErrors}\n`;
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

export async function runValidationOnLoadCSV(csvFile: string) {
    const workbook = XLSX.read(csvFile);
    const workBookRows = XLSX.utils.sheet_to_json(workbook.Sheets.Sheet1);
    let reportOutput = '';
    let rowIdx = 2; // Rows start at 1 in excel so first row with data, after header, is row 2
    // Do the formatting and then start validating
    const formattedRows = formatRows('UploadedFile', workBookRows);

    if (!formattedRows || formattedRows.length === 0) {
        reportOutput = 'No data found to validate. Was this a valid CSV file?';
    } else {
        for (const row of formattedRows) {
            const title = getCell(row, 'naming.designation');
            const datatype = getCell(row, 'datatypeValueList:datatype');
            const permissibleValueString = getCell(row, 'valueMeaningName').replace(/,|\n/g, ';');
            if (datatype !== 'Value List' && permissibleValueString) {
                reportOutput += generateErrorLogForCDE(`Data type is : '${datatype}' but permissible values were specified. Should this be a Value List type?\n`, rowIdx, title);
            }

            // Validate PVs
            if (datatype === 'Value List') {
                const pvArray = parsePermissibleValueArray(row);
                const valueDefArray = parseValueDefinitionArray(row);
                const valueMeaningArray = parseValueMeaningCodeArray(row);
                const valueMeaningCodeSystem: PermissibleValueCodeSystem = parseCodeSystemName(getCell(row, 'Value Meaning Terminology Source'));

                const errorOutput = validatePermissibleValues(pvArray, valueDefArray, valueMeaningArray, title);

                const valueDomain = {
                    datatype: 'Value List',
                    uom: '',
                    permissibleValues: pvArray.map((value, i) => ({
                        permissibleValue: value,
                        valueMeaningName: value,
                        valueMeaningCode: valueMeaningArray[i],
                        valueMeaningDefinition: valueDefArray[i] ? valueDefArray[i].split(':')[1].trim() : '',
                        codeSystemName: valueMeaningCodeSystem
                    })) as PermissibleValue[]
                };

                const umlsErrors = await validateAgainstUMLS(valueDomain.permissibleValues, title);

                if (!!errorOutput || !!umlsErrors) {
                    reportOutput += generateErrorLogForCDE(errorOutput + umlsErrors, rowIdx, title);
                }
            }

            rowIdx++
        }
    }

    return reportOutput;
}

function generateErrorLogForCDE(lines: string, rowNum: number, cdeName: string) {
    return `Row ${rowNum}\nCDE: ${cdeName}\nIssue(s): ${lines}\n`;
}