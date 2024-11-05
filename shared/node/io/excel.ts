import { CellObject, WorkBook, WorkSheet } from 'xlsx';

export type ErrorTypes =
    | 'Code'
    | 'Column Heading'
    | 'Extra'
    | 'Length'
    | 'Manual Intervention'
    | 'Required'
    | 'Reuse'
    | 'Spellcheck'
    | 'Suggestion'
    | 'Duplicated CDEs'
    | 'Template';
export type ExcelValue = CellObject | string | number | boolean | Date | null | undefined;
export type Expectations = Record<number, string>; // columns mapped to text that is supposed to be in the cell
export type Row = ExcelValue[];
export type WithError = (type: ErrorTypes, message: string) => void;

export function cellObjectValue(cell: ExcelValue): Exclude<ExcelValue, CellObject> {
    return typeof cell === 'object' && !(cell instanceof Date) ? cell?.v : cell;
}

export function cellValue(withError: WithError, cell: ExcelValue): Exclude<ExcelValue, CellObject> {
    const value = cellObjectValue(cell);
    if (typeof value === 'string' && value.length === 32767) {
        withError(
            'Length',
            'Maximum cell size of 32767 characters reached. Please split into another column with starting with [2].'
        );
    }
    return trim(value);
}

export function combineLines(value: string): string;
export function combineLines(value: ExcelValue): ExcelValue;
export function combineLines(value: ExcelValue): ExcelValue {
    return typeof value === 'string' ? value.replaceAll(/\s+/g, ' ').trim() : value;
}

export function expectFormTemplate(withError: WithError, row: Row, expect?: Expectations, message?: string): void {
    if (!expect) {
        return;
    }
    (Object.keys(expect) as unknown as number[]).forEach(column => {
        const expectation = expect[column];
        if (trim(row[column]) !== trim(expectation)) {
            withError('Template', message || `Expected: ${expectation} : Found: ${row[column]}.`);
        }
    });
}

export function extractFormValue(
    withError: WithError,
    row: Row,
    readColumn: number,
    formColumns: number = -1,
    expect?: Expectations
): ExcelValue {
    if (readColumn < 0) {
        withError('Template', `Read column is wrong.`);
        return null;
    }
    if (readColumn > row.length - 1) {
        withError('Template', `Read column ${readColumn} outside row ${row.length}.`);
        return null;
    }
    if (formColumns > -1) {
        if (readColumn >= formColumns) {
            withError('Template', 'Read column outside form columns range.');
            return null;
        }
        if (formColumns !== row.length) {
            withError('Template', `Form expected to have ${formColumns} columns but found ${row.length}.`);
            return null;
        }
    }
    expectFormTemplate(withError, row, expect);
    return row[readColumn];
}

export function getLink(ws: WorkSheet, location: string = 'A1'): string | undefined {
    return ws[location]?.l?.Target;
}

export function getSheet(wb: WorkBook, name: string): WorkSheet | undefined {
    return wb.Sheets[name];
}

export function trim(value: string): string;
export function trim<T>(value: T): T;
export function trim<T>(value: T | string): T | string {
    return typeof value === 'string' ? value.trim() : value;
}
