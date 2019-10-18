import { isEmpty, toLower, trim, words, join, isEqual } from 'lodash';
import { mergeClassificationByOrg } from 'ingester/shared/utility';

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

export function formatRows(csvFileName: string, rows: any[]) {
    const formattedRows: any[] = [];
    rows.forEach((row, i) => {
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
            console.log(`${csvFileName} has empty variablename. row: ${i}`);
            process.exit(1);
        }
        if (isEmpty(formattedRow.title)) {
            console.log(`${csvFileName} has empty title. row: ${i}`);
            process.exit(1);
        }
        formattedRows.push(formattedRow);
    });
    return formattedRows;
}

export function removePreclinicalClassification(elt: any) {
    elt.classification.forEach((c: any) => {
        if (c.stewardOrg.name === 'NINDS') {
            c.elements = c.elements.filter((e: any) => !isEqual(e.name, 'Preclinical TBI'));
        }
    });
}

export function changeNindsPreclinicalNeiClassification(existingElt, newObj, classificationOrgName) {
    const existingObj = existingElt.toObject();
    mergeClassificationByOrg(existingObj, newObj, classificationOrgName);
    existingElt.classification = existingObj.classification;
    removePreclinicalClassification(existingElt);
}
