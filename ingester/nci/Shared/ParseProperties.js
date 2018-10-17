exports.parseProperties = nciCde => {
    let properties = [{
        key: "caDSR_Context",
        source: source,
        value: nciCde.CONTEXTNAME[0]
    }, {
        key: "caDSR_Short_Name",
        source: source,
        value: nciCde.PREFERREDNAME[0]
    }];
    if (nciCde.ALTERNATENAMELIST[0] && nciCde.ALTERNATENAMELIST[0].ALTERNATENAMELIST_ITEM.length > 0) {
        nciCde.ALTERNATENAMELIST[0].ALTERNATENAMELIST_ITEM.forEach(altName => {
            if (["USED_BY"].indexOf(altName.AlternateNameType[0]) === -1) {
                properties.push({
                    key: altName.AlternateNameType[0],
                    value: altName.AlternateName[0]
                });
            }
        });
    }
    return properties;
};