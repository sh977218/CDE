import * as _isEmpty from 'lodash/isEmpty';
import * as _trim from 'lodash/trim';
import { PermissibleValueCodeSystem } from 'shared/models.model';

const CSV_HEADER_MAP: Record<string, string> = {
    'naming.designation': 'CDE Name',
    'naming.definiton': 'CDE Definition',
    source: 'Question Source /Origin/Reference',
    'datatypeValueList:datatype': 'CDE Data Type',
    valueMeaningName: 'Value Meaning Label\r\n',
    valueMeaningCode: 'Value/Code',
    codeSystemName: 'Value Code System',
    valueMeaningDefinition: 'Value Meaning Definition',
    origin: 'DEC Concept Terminology Source',
    originId: 'Data Element Concept (DEC) Identifier'
};

export function formatRows(csvFileName: string, rows: any[]) {
    const formattedRows: Record<string,string>[] = [];
    rows.forEach((row, i) => {
        const formattedRow: Record<string,string> = {};
        for (const p in row) {
            if (row.hasOwnProperty(p)) {
                const formattedP = formatKey(p);
                if (!_isEmpty(formattedP)) {
                    if (formattedP.split('\n')[1] === 'nlm qa recommendation') {
                        formattedRow[_trim(formattedP.split('\n')[0])] = _trim(row[p]);
                    } else {
                        formattedRow[formattedP] = _trim(row[p]);
                    }
                }
            }
        }
        formattedRows.push(formattedRow);
    });
    return formattedRows;
}

export function getCell(row: Record<string,string>, header: string) : string {
    const key = formatKey(header);
    const value = row[key];
    if (!_isEmpty(value)) {
        return _trim(value);
    } else {
        return '';
    }
}

export function formatKey(key: string) {
    const mappedKey = CSV_HEADER_MAP[key];
    if (!mappedKey) {
        return _trim(key.toLowerCase());
    } else {
        return _trim(mappedKey.toLowerCase());
    }
}

export function parsePermissibleValueArray(row: Record<string, string>): string[] {
    return getCell(row, 'valueMeaningName').replace(/,|\n/g, ';').split(';')
        .map(t => t.trim())
        .filter(t => t);
}

export function parseValueDefinitionArray(row: Record<string,string>) {
    let valueMeaningDefinitionString = getCell(row, 'valueMeaningDefinition').split(';\n').join(';');
    valueMeaningDefinitionString = valueMeaningDefinitionString.split(String.fromCharCode(145, 145)).join('"');
    valueMeaningDefinitionString = valueMeaningDefinitionString.split(String.fromCharCode(146, 146)).join('"');
    valueMeaningDefinitionString = valueMeaningDefinitionString.split(String.fromCharCode(145)).join("'");
    valueMeaningDefinitionString = valueMeaningDefinitionString.split(String.fromCharCode(146)).join("'");

    return valueMeaningDefinitionString.split(';').filter(t => t.trim()).map(t => t.trim());
}

export function parseValueMeaningCodeArray(row: Record<string,string>) {
    const valueMeaningCodeString = getCell(row, 'Value Meaning Terminology Concept Identifier').split(';\n').join(';');

    return valueMeaningCodeString.split(';').filter(t => t.trim()).map(t => t.trim());
}

const CODE_SYSTEM_MAP: Record<string, PermissibleValueCodeSystem> = {
    'UMLS Metathesaurus': 'UMLS',
}

export function parseCodeSystemName(key: string) {
    const mappedKey = CODE_SYSTEM_MAP[key];
    if (!mappedKey) {
        return key as PermissibleValueCodeSystem;
    } else {
        return mappedKey;
    }
}