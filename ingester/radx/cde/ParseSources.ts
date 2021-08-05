import { imported } from 'ingester/shared/utility';
import { DEFAULT_RADX_CONFIG } from 'ingester/radx/shared/utility';


export function parseSources(){
    return [{sourceName: DEFAULT_RADX_CONFIG.source, imported}];
}