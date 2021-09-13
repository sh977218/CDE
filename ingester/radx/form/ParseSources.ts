import { imported } from 'ingester/shared/utility';
import { DEFAULT_RADX_CONFIG } from 'ingester/radx/shared/utility';
import { getCell } from 'shared/loader/utilities/utility';

export function parseSources(row: any) {
    /*let source = getCell(row, 'source');
    if(!source){
        source = 'Placeholder source';
    }
    return [{sourceName: source, imported}];*/

    return [{sourceName: DEFAULT_RADX_CONFIG.source, imported}];
}