exports.parseIds = function (loinc) {
    var ids = [];
    ids.push({source: 'LOINC', id: loinc.loincId, version: loinc.version});
    return ids;
};
