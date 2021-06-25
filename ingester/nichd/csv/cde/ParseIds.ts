import { isEmpty, trim } from 'lodash';
import { NichdConfig } from 'ingester/nichd/shared/utility';

export function parseNichdIds(row: any, config: NichdConfig) {
    const ids = [];
    const variableName = row['Variable / Field Name'];
    if (!isEmpty(variableName)) {
        ids.push({
            source: config.idSource,
            id: variableName
        });
    }
    return ids;
}

export function addNichdIdentifier(cde: any, row: any, config: NichdConfig) {
    const variableName = trim(row['Variable / Field Name']);
    if (!isEmpty(variableName)) {
        let found = false;
        cde.ids.forEach((d: any) => {
            if (d.id === variableName && d.source === config.idSource) {
                found = true;
            }
        });
        if (!found) {
            cde.ids.push({
                source: config.idSource,
                id: variableName
            });
        }
    }
}
