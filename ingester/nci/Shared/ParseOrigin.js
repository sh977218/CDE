exports.parseOrigin = nciCde => {
    let origin = '';
    if (nciCde.ORIGIN && de.ORIGIN[0] && nciCde.ORIGIN[0].length > 0 && (typeof nciCde.ORIGIN[0]) === 'string') {
        origin = nciCde.ORIGIN[0];
    }
    return origin;
}
