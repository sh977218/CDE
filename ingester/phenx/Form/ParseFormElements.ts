import { existsSync } from 'fs';
import { find } from 'lodash';
import { parseFormElements as parseLoincFormElements } from '../../loinc/Form/ParseFormElements';
import { map as orgMapping } from '../../loinc/Mapping/ORG_INFO_MAP';
import { parseFormElements as parseRedcapFormElements } from '../redCap/ParseRedCap';
import { leadingZerosProtocolId } from 'ingester/phenx/Form/ParseAttachments';

const zipFolder = 's:/MLB/CDE/PhenX/www.phenxtoolkit.org/toolkit_content/redcap_zip/';

export async function parseFormElements(protocol, attachments, newForm) {
    let loinc = find(protocol.standards, standard => standard.Source === 'LOINC');
    if (loinc) {
        let formElements = await parseLoincFormElements(loinc, orgMapping['PhenX']);
        newForm.formElements = formElements;
    } else {
        let leadingZeroProtocolId = leadingZerosProtocolId(protocol.protocolID);
        let zipFile = zipFolder + 'PX' + leadingZeroProtocolId + '.zip';
        if (existsSync(zipFile)) {
            await parseRedcapFormElements(protocol, attachments, newForm);
        }
    }
    newForm.formElements.unshift({
        "elementType": "section",
        "instructions": {
            value: protocol.specificInstructions,
            valueFormat: "html"
        },
        "formElements": []
    });

}