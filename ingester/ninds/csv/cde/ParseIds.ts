import { isEmpty } from 'lodash';
import { getCell } from 'ingester/ninds/csv/cde/cde';

export function parseIds(row) {
    const ids = [];
    const variableName = getCell(row, 'Variable Name');
    if (!isEmpty(variableName)) {
        ids.push({
            source: 'NINDS Preclinical',
            id: variableName,
            version: '1'
        });
    }
    return ids;
}
