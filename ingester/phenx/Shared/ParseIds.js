exports.parseIds = protocol => {
    let ids = [];
    let protocolId = protocol['protocolId'];
    if (protocolId)
        ids.push({
            source: 'PhenX',
            id: protocolId,
            version: "23"
        });
    return ids;
};
