import {isEmpty, trim }from 'lodash';
import { PermissibleValueCodeSystem } from 'shared/models.model';

export const CSV_HEADER_MAP: Record<string, string> = {
    'naming.designation': 'CDE Name',
    'naming.definiton': 'CDE Definition',
    source: 'CDE Source',
    'datatypeValueList:datatype': 'CDE Data Type',
    valueMeaningName: 'Permissible Value (PV) Labels',
    valueMeaningCode: 'Value/Code',
    codeSystemName: 'Value Code System',
    valueMeaningDefinition: 'Permissible Value (PV) Definitions',
    origin: 'DEC Concept Terminology Source',
    originId: 'Data Element Concept (DEC) Identifier'
};

export const REQUIRED_FIELDS: string[] = [
    'naming.designation',
    'naming.definiton',
    'datatypeValueList:datatype',
    'source',
    'Preferred Question Text',
    'origin',
    'originId'
];

export const SPELL_CHECK_FIELDS: string[] = [
    'naming.designation',
    'naming.definiton'
];

export function formatRows(csvFileName: string, rows: any[], skipCount: number) {
    const formattedRows: Record<string,string>[] = [];
    rows.forEach((row, i) => {
        if(i < skipCount){
            return;
        }
        const formattedRow: Record<string,string> = {};
        for (const p in row) {
            if (row.hasOwnProperty(p)) {
                const formattedP = formatKey(p);
                if (!isEmpty(formattedP)) {
                    if (formattedP.split('\n')[1] === 'nlm qa recommendation') {
                        formattedRow[trim(formattedP.split('\n')[0])] = trim(row[p]);
                    } else {
                        formattedRow[formattedP] = trim(row[p]);
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
    if (!isEmpty(value)) {
        return trim(value);
    } else {
        return '';
    }
}

export function formatKey(key: string) {
    const mappedKey = CSV_HEADER_MAP[key];
    if (!mappedKey) {
        return trim(key.toLowerCase());
    } else {
        return trim(mappedKey.toLowerCase());
    }
}

export function parsePermissibleValueArray(row: Record<string, string>): string[] {
    return getCell(row, 'valueMeaningName').split('|')
        .map(t => t.trim())
        .filter(t => t);
}

export function parseValueDefinitionArray(row: Record<string,string>) {
    return getCell(row, 'valueMeaningDefinition').split('|')
        .map(t => t.trim())
        .filter(t => t);
}

export function parseValueMeaningCodeArray(row: Record<string,string>) {
    return getCell(row, 'Permissible Value (PV) \nConcept Identifiers').split('|')
        .map(t => t.trim())
        .filter(t => t);
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
