import {find} from 'lodash';
import {existsSync} from 'fs';

const ParseRedCap = require('./redCap/ParseRedCap');

const ParseLOINC = require('../../loinc/Form/ParseFormElements');
const orgMapping = require('../../loinc/Mapping/ORG_INFO_MAP').map;

const zipFolder = 's:/MLB/CDE/phenx/original-phenxtoolkit.rti.org/toolkit_content/redcap_zip/';

export async function parseFormElements (protocol, attachments, newForm) {
    let loinc = find(protocol.Standards, standard => standard.Source === 'LOINC');
    if (loinc) {
        let formElements = await ParseLOINC.parseFormElements(loinc, orgMapping['PhenX']);
        newForm.formElements = formElements;
    } else {
        let protocolId = protocol.protocolId;
        let zipFile = zipFolder + 'PX' + protocolId + '.zip';
        if (existsSync(zipFile)) {
            await ParseRedCap.parseFormElements(protocol, attachments, newForm);
        }
    }
};