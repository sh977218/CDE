import {imported} from 'ingester/shared/utility';
import {DEFAULT_LOADER_CONFIG} from 'ingester/general/shared/utility';

export function parseSources(row: any) {
    /*let source = getCell(row, 'source');
    if(!source){
        source = 'Placeholder source';
    }
    return [{sourceName: source, imported}];*/

    return [{sourceName: DEFAULT_LOADER_CONFIG.source, imported}];
}
