import { isEmpty } from 'lodash';

export function parseIds(protocol) {
    let ids = [];
    let protocolId = protocol.protocolID;
    if (!isEmpty(protocolId)) {
        ids.push({
            source: 'PhenX',
            id: protocolId
        });
    }
    return ids;
}

