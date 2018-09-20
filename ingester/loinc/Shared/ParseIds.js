exports.parseIds = function (loinc) {
    let ids = [];
    ids.push({source: 'LOINC', id: loinc.loincId, version: loinc.VERSION});
    return ids;
};
