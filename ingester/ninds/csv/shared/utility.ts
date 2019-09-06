import { isEmpty, toLower, trim, words } from 'lodash';

export function getCell(row: any, header: string) {
    const formattedHeader = words(toLower(header)).join('');
    if (!isEmpty(row[formattedHeader])) {
        return trim(row[formattedHeader]);
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
                const formattedP = words(toLower(p)).join('');
                formattedRow[formattedP] = row[p];
            }
        }
        formattedRows.push(formattedRow);
    });
    return formattedRows.filter(r => !isEmpty(r.variablename) && !isEmpty(r.title));
}