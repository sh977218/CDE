import { imported } from 'ingester/shared/utility';
import { DEFAULT_LOADER_CONFIG } from 'ingester/general/shared/utility';

export function parseSources() {
    return [{ sourceName: DEFAULT_LOADER_CONFIG.source, imported }];
}
