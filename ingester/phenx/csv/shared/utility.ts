import {trim} from 'lodash';

export function formatRows(rows: any[]) {
    const formattedRows: any[] = [];
    rows.forEach((row, i) => {
        const formattedRow: any = {};
        for (const p in row) {
            if (row.hasOwnProperty(p)) {
                formattedRow[p] = trim(row[p]);
            }
        }
        formattedRows.push(formattedRow);
    });
    return formattedRows;
}

export function doPhenxClassification(existingCde: any, newCdeObj: any) {
    const phenxClassifications = existingCde.classification.filter((c: any) => c.stewardOrg.name === 'PhenX');
    const otherClassifications = existingCde.classification.filter((c: any) => c.stewardOrg.name !== 'PhenX');
    existingCde.classification = newCdeObj.classification.concat(otherClassifications);
}
