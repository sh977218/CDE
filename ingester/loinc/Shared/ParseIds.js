exports.parseIds = function (loinc) {
    let ids = [];
    ids.push({source: 'LOINC', id: loinc.loincId, version: loinc.version});
    if (loinc.deId) {
        ids.push({source: 'AHRQ', id: loinc.deId, version: '1.2'})
    }
    return ids;
};
