const CSV = require('csv');
import { readFileSync } from 'fs';
import { filter, isEmpty, isEqual, join, replace, trim, words } from 'lodash';

const NINDS_CSV_HEADER_MAP = {
    'Category/Group': 'Group Name',
    GroupName: 'Group Name'
};

function formatKey(key: string) {
    const mappedKey = NINDS_CSV_HEADER_MAP[key];
    if (!mappedKey) {
        return trim(key.toLowerCase());
    } else {
        return trim(mappedKey.toLowerCase());
    }
}

export function getCell(row: any, header: string) {
    const key = formatKey(header);
    const value = row[key];
    if (!isEmpty(value)) {
        return trim(value);
    } else {
        return '';
    }
}

export function formatRows(csvFileName: string, rows: any[]) {
    const formattedRows: any[] = [];
    rows.forEach((row, i) => {
        const formattedRow: any = {};
        for (const p in row) {
            if (row.hasOwnProperty(p)) {
                const formattedP = formatKey(p);
                if (!isEmpty(formattedP)) {
                    formattedRow[formattedP] = trim(row[p]);
                }
            }
        }

        let variableName = getCell(formattedRow, 'variable name');
        const name = getCell(formattedRow, 'name');
        if (name) {
            variableName = name;
        }
        const title = getCell(formattedRow, 'title');
        if (isEmpty(variableName)) {
            console.log(`${csvFileName} has empty variablename. row: ${i}`);
            process.exit(1);
        }
        if (isEmpty(title)) {
            console.log(`${csvFileName} has empty title. row: ${i}`);
            process.exit(1);
        }
        formattedRows.push(formattedRow);
    });
    return formattedRows;
}

export function convertFileNameToFormName(csvFileName: string) {
    const replaceCsvFileName = replace(csvFileName, '.csv', '');
    const wordsCsvFileName = words(replaceCsvFileName);
    const filterCsvFileName = filter(wordsCsvFileName, o => {
        const isC = isEqual(o, 'C');
        const oNumber = Number(o);
        const isNotNumber = isNaN(oNumber);
        return !isC && isNotNumber;
    });
    const joinCsvFileName = join(filterCsvFileName, ' ');
    return trim(joinCsvFileName);
}

export function parseOneCsv(csvPath: string, csvFileName: string): Promise<any> {
    return new Promise(resolve => {
        const cond = {
            columns: true,
            rtrim: true,
            trim: true,
            relax_column_count: true,
            skip_empty_lines: true,
            skip_lines_with_empty_values: true
        };
        CSV.parse(readFileSync(csvPath), cond, (err: any, data: any[]) => {
            if (err) {
                console.log(err);
                process.exit(1);
            } else {
                const rows = formatRows(csvFileName, data);
                resolve(rows);
            }
        });
    });
}
