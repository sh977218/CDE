import { isEmpty } from 'lodash';
import { DEFAULT_NHLBI_CONFIG, getCell } from 'ingester/nhlbi/shared/utility';


export function parseNhlbiIds(row: any) {
    const ids = [];
    const variableName = getCell(row, DEFAULT_NHLBI_CONFIG.source);
    if (!isEmpty(variableName)) {
        ids.push({
            source: 'ISTH',
            id: variableName
        });
    }
    return ids;
}