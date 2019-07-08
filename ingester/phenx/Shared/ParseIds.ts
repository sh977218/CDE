export function parseIds(protocol) {
    let ids = [];
    let protocolId = protocol.protocolID;
    if (protocolId) {
        ids.push({
            source: 'PhenX',
            id: protocolId
        });
    }
    return ids;
}