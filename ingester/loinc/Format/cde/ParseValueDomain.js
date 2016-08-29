var uom_datatype_map = require('../../Mapping/LOINC_UOM_DATATYPE_MAP').map;
var loinc_num_datatype_map = {
    '62317-3': 'Date',
    '62328-0': 'Number'
};

exports.parseValueDomain = function (loinc) {
    var valueDomain = {
        datatype: 'Text',
        uom: ''
    };
    var versionStr = loinc['VERSION']['VERSION'].replace('Generated from LOINC version', '').trim();
    var version = versionStr.substring(0, versionStr.length - 1);
    if (loinc['NORMATIVE ANSWER LIST'] || loinc['PREFERRED ANSWER LIST'] || loinc['EXAMPLE ANSWER LIST']) {
        valueDomain.datatype = 'Value List';
        var type;
        if (loinc['NORMATIVE ANSWER LIST']) type = 'NORMATIVE ANSWER LIST';
        if (loinc['PREFERRED ANSWER LIST']) type = 'PREFERRED ANSWER LIST';
        if (loinc['EXAMPLE ANSWER LIST']) type = 'EXAMPLE ANSWER LIST';
        valueDomain.ids = [{
            id: loinc[type][type].answerListId.ID,
            source: 'LOINC',
            version: version
        }];
        var sortedAnswerList = loinc[type][type].answerList.sort(function (a, b) {
            return a['SEQ#'] - b['SEQ#'];
        });
        valueDomain.permissibleValues = sortedAnswerList.map(function (a) {
            return {
                permissibleValue: a['Answer'],
                valueMeaningName: a['Answer'],
                valueMeaningCode: a['Answer ID'],
                codeSystemName: 'LOINC'
            }
        });
    } else {
        if (loinc['EXAMPLE UNITS'] && loinc['EXAMPLE UNITS']['EXAMPLE UNITS']) {
            var unit = loinc['EXAMPLE UNITS']['EXAMPLE UNITS'][0].Unit;
            valueDomain.datatype = uom_datatype_map[unit];
        }
    }
    if (loinc_num_datatype_map[loinc.loincId]) {
        valueDomain.datatype = loinc_num_datatype_map[loinc.loincId];
    }
    return valueDomain;
}
;