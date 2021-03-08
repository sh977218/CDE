import { isEmpty } from 'lodash';
import { DEFAULT_RADX_UP_CONFIG } from 'ingester/phenx/Shared/utility';

export function parseIds(row: any, config = DEFAULT_RADX_UP_CONFIG) {
    const ids: any[] = [];
    const variableName = row['Variable / Field Name'];
    if (!isEmpty(variableName)) {
        ids.push({
            source: config.source,
            id: variableName
        });
    }

    return ids;
}

export function parseRadxIds(row: any, config = DEFAULT_RADX_UP_CONFIG) {
    const ids: any[] = [];
    const variableName = row['Variable / Field Name'];
    if (!isEmpty(variableName)) {
        ids.push({
            source: 'RADx-UP Variable',
            id: variableName
        });
    }

    return ids;
}
