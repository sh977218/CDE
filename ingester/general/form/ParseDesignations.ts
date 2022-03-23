import { trim } from 'lodash';
import { getCell } from 'shared/loader/utilities/utility';

export function parseDesignations(row: any) {
    return [{designation: trim(getCell(row, 'naming.designation')), tags: []}];
}