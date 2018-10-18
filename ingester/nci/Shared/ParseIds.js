exports.parseIds = nciCde => {
    return [{
        source: 'caDSR',
        id: nciCde.PUBLICID[0],
        version: nciCde.VERSION[0]
    }];
};
