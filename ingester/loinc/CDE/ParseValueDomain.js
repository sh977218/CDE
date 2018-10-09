const uom_datatype_map = require('../Mapping/LOINC_UOM_DATATYPE_MAP').map;

exports.parseValueDomain = function (loinc) {
    let valueDomain = {
        datatype: 'Text',
        uom: '',
        permissibleValues: []
    };
    let version = loinc.VERSION.trim();

    let type;
    if (loinc['NORMATIVE ANSWER LIST']) type = 'NORMATIVE ANSWER LIST';
    if (loinc['PREFERRED ANSWER LIST']) type = 'PREFERRED ANSWER LIST';
    if (loinc['EXAMPLE ANSWER LIST']) type = 'EXAMPLE ANSWER LIST';
    if (loinc[type]) {
        let temp = loinc[type];
        if (loinc['PREFERRED ANSWER LIST']) temp = loinc['PREFERRED ANSWER LIST'];
        if (loinc['EXAMPLE ANSWER LIST']) temp = loinc['EXAMPLE ANSWER LIST'];
        if (temp['Externally Defined']) {
            valueDomain.datatype = 'Externally Defined';
            valueDomain.datatypeExternallyDefined = {
                link: temp['Link to external list'],
                description: temp['Source']
            }
        } else {
            valueDomain.datatype = 'Value List';
            valueDomain.ids = [{
                id: loinc[type].answerListId.ID,
                source: 'LOINC',
                version: version
            }];
            let sortedAnswerList = loinc[type].answerList.sort((a, b) => a['SEQ#'] - b['SEQ#']);
            if (!valueDomain)
                debugger;
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
        }
    } else {
        if (loinc['EXAMPLE UNITS']) {
            loinc['EXAMPLE UNITS'].forEach(unit => {
                if (unit['Source Type'] === 'EXAMPLE UCUM UNITS') {
                    valueDomain.datatype = uom_datatype_map[unit];
                }
            });
            if (valueDomain.datatype === 'Date') {
                valueDomain.datatypeDate = {format: unit};
            }
        }
    }

    return valueDomain;
};