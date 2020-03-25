import { isEmpty } from 'lodash';
import { getCell } from 'ingester/ninds/csv/shared/utility';

export function parseIds(row: any) {
    const ids = [];
    const variableName = getCell(row, 'Variable Name');
    if (!isEmpty(variableName)) {
        ids.push({
            source: 'BRICS Variable Name',
            id: variableName
        });
    }
    return ids;
}

export function parseNhlbiIds(row: any) {
    const ids = [];
    const variableName = getCell(row, 'Name');
    if (!isEmpty(variableName)) {
        ids.push({
            source: 'BRICS Variable Name',
            id: variableName
        });
    }

    // this column named as external ninds id, but it's actually make up ninds id if the id doesn't exist in ninds
    const externalNindsId = getCell(row, 'External ID.NINDS');
    if (!isEmpty(variableName)) {
        ids.push({
            source: 'NHLBI ID',
            id: externalNindsId
        });
    }
    return ids;
}
