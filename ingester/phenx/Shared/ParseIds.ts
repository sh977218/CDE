import { isEmpty, sortBy } from 'lodash';

export function parseIds(protocol) {
    const ids: any[] = [];
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
                id: s.ID,
                version: s.loinc.VERSION ? s.loinc.VERSION : ''
            });
        }
    });
    return sortBy(ids, ['source', 'id']);

}

