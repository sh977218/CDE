exports.parseSources = function (loinc) {
    var sources = [];
    var source = {sourceName: 'LOINC'};
    if (loinc['BASIC ATTRIBUTES']) {
        source.created = loinc['BASIC ATTRIBUTES']['BASIC ATTRIBUTES']['Created On'];
        source.registrationStatus = loinc['BASIC ATTRIBUTES']['BASIC ATTRIBUTES']['Status'];
    }
    if (loinc['EXAMPLE UNITS']) {
        source.datatype = loinc['EXAMPLE UNITS']['EXAMPLE UNITS'][0].Unit;
    }
    sources.push(source);
    return sources;
};
