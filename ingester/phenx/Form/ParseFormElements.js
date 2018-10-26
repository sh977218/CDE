const _ = require('lodash');
const fs = require('fs');
const AdmZip = require('adm-zip');

const ParseRedCap = require('./redCap/ParseRedCap');

const ParseLOINC = require('../../loinc/Form/ParseFormElements');
const orgMapping = require('../../loinc/Mapping/ORG_INFO_MAP').map;

const zipFolder = 's:/MLB/CDE/phenx/original-phenxtoolkit.rti.org/toolkit_content/redcap_zip/';

exports.parseFormElements = async (protocol, attachments) => {
    let loinc = _.find(protocol.Standards, standard => standard.Source === 'LOINC');
    if (loinc) {
        return await ParseLOINC.parseFormElements(loinc, orgMapping['PhenX']);
    } else {
        let protocolId = protocol.protocolId;
        let zipFile = zipFolder + 'PX' + protocolId + '.zip';
        if (fs.existsSync(zipFile)) {
            return await ParseRedCap.parseFormElements(protocol, attachments);
        } else return [];
    }
};