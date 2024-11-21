import { getCell } from 'shared/loader/utilities/utility';
import { trim } from 'lodash';

export function parseIds(row: any) {
    const id = trim(getCell(row, 'naming.designation').split('-')[0]);

    return {
        source: 'NHLBI CONNECTS ID',
        id,
    };
}
