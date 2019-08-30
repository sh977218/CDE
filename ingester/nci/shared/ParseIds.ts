export function parseIds(nciXmlCde) {
    return [{
        source: 'caDSR',
        id: nciXmlCde.PUBLICID[0],
        version: nciXmlCde.VERSION[0]
    }];
}
