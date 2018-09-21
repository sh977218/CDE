const uom_datatype_map = require('../Mapping/LOINC_UOM_DATATYPE_MAP').map;
const loinc_num_datatype_map = {
    '62317-3': 'Date',
    '62328-0': 'Number'
};

exports.parseValueDomain = function (loinc) {
    let valueDomain = {
        datatype: 'Text',
        uom: ''
    };
    let version = loinc.VERSION.trim();
    if (loinc['NORMATIVE ANSWER LIST'] || loinc['PREFERRED ANSWER LIST'] || loinc['EXAMPLE ANSWER LIST']) {
        valueDomain.datatype = 'Value List';
        let type;
        if (loinc['NORMATIVE ANSWER LIST']) type = 'NORMATIVE ANSWER LIST';
        if (loinc['PREFERRED ANSWER LIST']) type = 'PREFERRED ANSWER LIST';
        if (loinc['EXAMPLE ANSWER LIST']) type = 'EXAMPLE ANSWER LIST';
        valueDomain.ids = [{
            id: loinc[type].answerListId.ID,
            source: 'LOINC',
            version: version
        }];
        let sortedAnswerList = loinc[type].answerList.sort((a, b) => a['SEQ#'] - b['SEQ#']);
        valueDomain.permissibleValues = sortedAnswerList.map(a => {
            let description = '';
            let name = '';
            let descriptionIndex = a['Answer'].indexOf('Description:');
            if (descriptionIndex !== -1) {
                name = a['Answer'].substring(0, descriptionIndex).trim();
                description = a['Answer'].substring(descriptionIndex + 12).trim();
            } else {
                name = a['Answer'];
            }
            let pv = {
                permissibleValue: a['Code'] ? a['Code'] : name,
                valueMeaningName: name,
                valueMeaningDefinition: description,
                valueMeaningCode: a['Answer ID'],
                codeSystemName: 'LOINC'
            };
            return pv;
        });
    } else {
        if (loinc['EXAMPLE UNITS']) {
            let unit = loinc['EXAMPLE UNITS'][0].Unit;
            valueDomain.datatype = uom_datatype_map[unit];
            if (valueDomain.datatype === 'Date') {
                valueDomain.datatypeDate = {format: unit};
            }
        }
    }
    if (loinc_num_datatype_map[loinc.loincId]) {
        valueDomain.datatype = loinc_num_datatype_map[loinc.loincId];
    }
    return valueDomain;
};