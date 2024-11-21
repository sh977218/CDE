export function parseProperties(nciXmlCde) {
    const properties = [{
        key: 'caDSR_Context',
        source: 'caDSR',
        value: nciXmlCde.CONTEXTNAME[0]
    }, {
        key: 'caDSR_Short_Name',
        source: 'caDSR',
        value: nciXmlCde.PREFERREDNAME[0]
    }];
    if (nciXmlCde.ALTERNATENAMELIST[0] && nciXmlCde.ALTERNATENAMELIST[0].ALTERNATENAMELIST_ITEM.length > 0) {
        nciXmlCde.ALTERNATENAMELIST[0].ALTERNATENAMELIST_ITEM.forEach(altName => {
            if (['USED_BY'].indexOf(altName.AlternateNameType[0]) === -1) {
                properties.push({
                    key: altName.AlternateNameType[0],
                    source: 'caDSR',
                    value: altName.AlternateName[0]
                });
            }
        });
    }
    return properties;
}

export function parseProperties2(xml) {
    const properties = [];
    if (xml.context) {
        properties.push({
            key: 'caDSR_Context',
            source: 'caDSR',
            value: xml.context
        })
    }
    if (xml.shortName) {
        properties.push({
            key: 'caDSR_Short_Name',
            source: 'caDSR',
            value: xml.shortName
        })
    }
    return properties;
}
