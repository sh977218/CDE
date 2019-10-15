import { isEmpty, toLower, trim, words, join } from 'lodash';

function formatKey(key: string) {
    const lowerKey = toLower(key);
    // only remove spaces, not '.'. For example, population.all
    const wordsKey = words(lowerKey, /[^\s]+/g);
    const joinKey = join(wordsKey, '');
    return trim(joinKey);
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

export function formatRows(rows: any[]) {
    const formattedRows: any[] = [];
    rows.forEach(row => {
        const formattedRow: any = {};
        for (const p in row) {
            if (row.hasOwnProperty(p)) {
                const formattedP = formatKey(p);
                if (!isEmpty(formattedP)) {
                    formattedRow[formattedP] = row[p];
                }
            }
        }
        if (isEmpty(formattedRow.variablename)) {
            console.log(`${formattedRow} has empty variablename`);
            process.exit(1);
        }
        if (isEmpty(formattedRow.title)) {
            console.log(`${formattedRow} has empty title`);
            process.exit(1);
        }
        formattedRows.push(formattedRow);
    });
    return formattedRows;
}
