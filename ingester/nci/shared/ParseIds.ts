export function parseIds(nciXmlCde) {
    return [{
        source: 'caDSR',
        id: nciXmlCde.PUBLICID[0],
        version: nciXmlCde.VERSION[0]
    }];
}
export function parseIds2(xml) {
    return [{
        source: 'caDSR',
        id: xml.publicID,
        version: xml.version
    }];
}
