import { existsSync } from 'fs';
import { find } from 'lodash';
import { parseFormElements as parseLoincFormElements } from '../../loinc/Form/ParseFormElements';
import { map as orgMapping } from '../../loinc/Mapping/ORG_INFO_MAP';
import { parseFormElements as parseRedcapFormElements } from '../redCap/ParseRedCap';

const zipFolder = 's:/MLB/CDE/PhenX/www.phenxtoolkit.org/toolkit_content/redcap_zip/';

export async function parseFormElements(protocol, attachments, newForm) {
    let loinc = find(protocol.standards, standard => standard.Source === 'LOINC');
    if (loinc) {
        let formElements = await parseLoincFormElements(loinc, orgMapping['PhenX']);
        formElements.unshift({
            "elementType": "section",
            "instructions": {
                value: protocol.specificInstructions
            },
            "formElements": []
        });
        newForm.formElements = formElements;
    } else {
        let protocolId = protocol.protocolID;
        let zipFile = zipFolder + 'PX' + protocolId + '.zip';
        if (existsSync(zipFile)) {
            await parseRedcapFormElements(protocol, attachments, newForm);
        }
    }
}