import {
    formatRows,
    getCell,
    parsePermissibleValueArray,
    parseValueDefinitionArray,
    parseValueMeaningCodeArray,
    parseCodeSystemName,
    REQUIRED_FIELDS,
    CSV_HEADER_MAP
} from 'shared/loader/utilities/utility';
import { DATA_TYPE_ARRAY } from 'shared/de/dataElement.model';
import { PermissibleValue, PermissibleValueCodeSystem } from 'shared/models.model';
import { validatePvs } from 'server/cde/utsValidate';
import * as XLSX from 'xlsx';

export function validatePermissibleValues(pvs: string[], valueDefs: string[], valueCodes: string[], name: string) {
    const output: string[] = [];

    if(pvs.length === 0){
        output.push('Data type is: Value List but no Value Meaning Labels were provided.');
    }

    if(valueDefs.length === 0){
        output.push('Data type is: Value List but no Value Meaning Definitions were provided.');
    }

    if(valueCodes.length === 0){
        output.push('Data type is: Value List but no Value Meaning Terminology Concept Identifiers were provided.');
    }

    if (valueDefs.length !== pvs.length || valueCodes.length !== pvs.length) {
        output.push('Mismatch between amount of permissible values and amount of codes and/or value definitions');
    }

    for (const i in valueDefs) {
        if (valueDefs[i].split(':')[0].trim() !== pvs[i]) {
            output.push(`Value Def: '${valueDefs[i]}' does not match Permissible Value: '${pvs[i]}'`);
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

function checkRequiredFields(row: Record<string,string>){
    const output: string[] = [];
    for(const field of REQUIRED_FIELDS){
        const data = getCell(row, field);
        if(!data){
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
    let rowIdx = 2; // Rows start at 1 in excel so first row with data, after header, is row 2
    // Do the formatting and then start validating
    const formattedRows = formatRows('UploadedFile', workBookRows);

    if (!formattedRows || formattedRows.length === 0) {
        fileErrors.push('No data found to validate. Was this a valid CSV file?');
    } else {
        for (const row of formattedRows) {
            const currentLogs = [] as string[];
            currentLogs.push(...checkRequiredFields(row));
            const title = getCell(row, 'naming.designation');
            const datatype = getCell(row, 'datatypeValueList:datatype');
            const permissibleValueString = getCell(row, 'valueMeaningName').replace(/,|\n/g, ';');
            if (datatype !== 'Value List' && permissibleValueString) {
                currentLogs.push(`Data type is: '${datatype}' but permissible values were specified. Should this be a Value List type?`);
            }

            // Validate PVs
            if (datatype === 'Value List') {
                const pvArray = parsePermissibleValueArray(row);
                const valueDefArray = parseValueDefinitionArray(row);
                const valueMeaningArray = parseValueMeaningCodeArray(row);
                const valueMeaningCodeSystem: PermissibleValueCodeSystem = parseCodeSystemName(getCell(row, 'Value Meaning Terminology Source'));

                currentLogs.push(...validatePermissibleValues(pvArray, valueDefArray, valueMeaningArray, title));

                if(!valueMeaningCodeSystem){
                    currentLogs.push(`Data type is: '${datatype}' but no Value Meaning Terminology Source was provided.`);
                }

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

                if(!!umlsErrors){
                    currentLogs.push(umlsErrors);
                }
            }

            if(!DATA_TYPE_ARRAY.includes(datatype)){
                currentLogs.push(`Data type '${datatype}' is not a recognized, valid CDE Data Type`);
            }

            if(currentLogs.length > 0){
                dataErrors.push({row: rowIdx, name: title, logs: currentLogs});
            }
            rowIdx++
        }
    }
    return { fileErrors, dataErrors };
}