import {isEmpty, trim} from 'lodash';

export function parseIds() {
    return [];
}

export function parseNhlbiIds(row: any) {
    const ids = [];
    const phenxProtocolId = row['PhenX Protocol'];
    if (!isEmpty(phenxProtocolId)) {
        ids.push({source: 'PhenX', id: trim(phenxProtocolId)});
    }
    const crfId = row.CrfId;
    if (!isEmpty(crfId)) {
        ids.push({source: 'NINDS', id: trim(crfId)});
    }
    return ids;
}
