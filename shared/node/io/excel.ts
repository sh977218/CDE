import { CellObject, WorkBook, WorkSheet } from 'xlsx';

export type ExcelValue = CellObject | string | number | boolean | Date | null | undefined;
export type Expectations = Record<number, string>; // columns mapped to text that is supposed to be in the cell
export type Row = ExcelValue[];
export type WithError = (errorSet: (string | undefined)[]) => void;

export function cellObjectValue(cell: ExcelValue): Exclude<ExcelValue, CellObject> {
    return typeof cell === 'object' && !(cell instanceof Date) ? cell?.v : cell;
}

export function cellValue(cell: ExcelValue): Exclude<ExcelValue, CellObject> {
    return trim(cellObjectValue(cell));
}

export function combineLines(value: string): string;
export function combineLines(value: ExcelValue): ExcelValue;
export function combineLines(value: ExcelValue): ExcelValue {
    return typeof value === 'string'
        ? value.replaceAll(/\s+/g, ' ').trim()
        : value;
}

export function expectFormTemplate(withError: WithError, row: Row, expect?: Expectations): void {
    if (!expect) {
        return;
    }
    withError((Object.keys(expect) as unknown as number[]).map(column => {
        const expectation = expect[column];
        if (trim(row[column]) !== trim(expectation)) {
            return `Expected: ${expectation} : Found: ${row[column]}`;
        }
    }));
}

export function extractFormValue(withError: WithError, row: Row, readColumn: number, formColumns: number = -1,
                                 expect?: Expectations): ExcelValue {
    if (readColumn < 0) {
        withError([`read column wrong`]);
        return null;
    }
    if (readColumn > row.length - 1) {
        withError([`read column ${readColumn} outside row ${row.length}`]);
        return null;
    }
    if (formColumns > -1) {
        if (readColumn >= formColumns) {
            withError(['read column oute form columns range']);
            return null;
        }
        if (formColumns !== row.length) {
            withError([`Form expected to have ${formColumns} columns but found ${row.length}`]);
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
