import { isEmpty } from 'lodash';

export function parseIds(protocol) {
    const ids = [];
    const protocolId = protocol.protocolID;
    if (!isEmpty(protocolId)) {
        ids.push({
            source: 'PhenX',
            id: protocolId
        });
    }
    protocol.standards.forEach(s => {
        if (s.Source === 'LOINC') {
            ids.push({
                source: 'LOINC',
                id: s.ID
            });
        }
    });
    return ids;
}

