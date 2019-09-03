export function parseOrigin(nciXmlCde) {
    let origin = '';
    if (nciXmlCde.ORIGIN && nciXmlCde.ORIGIN[0] && nciXmlCde.ORIGIN[0].length > 0 && (typeof nciXmlCde.ORIGIN[0]) === 'string') {
        origin = nciXmlCde.ORIGIN[0];
    }
    return origin;
}
