import { isEmpty, toLower, trim, words } from 'lodash';

export function getCell(row, header) {
    const formattedHeader = words(toLower(header)).join('');
    if (!isEmpty(row[formattedHeader])) {
        return trim(row[formattedHeader]);
    } else {
        return '';
    }
}

export function formatRows(rows) {
    const formattedRows = [];
    rows.forEach(row => {
        const formattedRow = {};
        for (const p in row) {
            const formattedP = words(toLower(p)).join('');
            formattedRow[formattedP] = row[p];
        }
        formattedRows.push(formattedRow);
    });
    return formattedRows.filter(r => !isEmpty(r['variablename']) && !isEmpty(r['title']));
}