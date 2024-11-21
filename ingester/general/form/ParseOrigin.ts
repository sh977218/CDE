import {getCell} from 'shared/loader/utilities/utility';


export function parseOrigin(row: any) {
    const origin = getCell(row, 'source');

    return origin;
}