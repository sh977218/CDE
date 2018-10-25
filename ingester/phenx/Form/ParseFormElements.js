const _ = require('lodash');

const ParseRedCap = require('./redCap/ParseRedCap');

const ParseLOINC = require('../../loinc/Form/ParseFormElements');
const orgMapping = require('../../loinc/Mapping/ORG_INFO_MAP').map;

exports.parseFormElements = async protocol => {
    let loinc = _.find(protocol.Standards, standard => standard.Source === 'LOINC');
    if (loinc) {
        return await ParseLOINC.parseFormElements(loinc, orgMapping['PhenX']);
    } else {
        return await ParseRedCap.parseFormElements(protocol);
    }
};