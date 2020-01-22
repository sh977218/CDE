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
