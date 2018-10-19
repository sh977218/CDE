const _ = require('lodash');

const ParseRedCap = require('./ParseRedCap');

const ParseLOINC = require('../../loinc/Form/ParseFormElements');
const orgMapping = require('../../loinc/Mapping/ORG_INFO_MAP').map;

exports.parseFormElements = async protocol => {
    let loinc = _.find(protocol.Standards, standard => standard.Source === 'LOINC');
    if (loinc) {
        let temp = await ParseLOINC.parseFormElements(loinc.loinc, orgMapping['PhenX']);
        return temp;
    } else {
        return await ParseRedCap.parseRedCap(protocol);
    }
};