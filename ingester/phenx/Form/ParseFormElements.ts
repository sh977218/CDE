import { find, isEmpty } from 'lodash';
import { parseFormElements as parseRedcapFormElements } from 'ingester/phenx/redCap/ParseRedCap';
import { parseFormElements as parseLoincFormElements } from 'ingester/loinc/Form/ParseFormElements';
import { map as orgMapping } from 'ingester/loinc/Mapping/ORG_INFO_MAP';

export async function parseFormElements(protocol, attachments, newForm) {
    let loincStandard = find(protocol.standards, standard => standard.Source === 'LOINC');
    if (isEmpty(loincStandard)) {
        await parseRedcapFormElements(protocol, attachments, newForm);
    } else {
        let formElements = await parseLoincFormElements(loincStandard, orgMapping['PhenX']);
        let loinc = loincStandard.loinc;
        if (!loinc['PANEL HIERARCHY']) {
            console.log(`${protocol.protocolID} has LOINC ${loinc.loincId} PANEL HIERARCHY is missing.`);
            process.exit(1);
        }
        newForm.formElements = formElements;
    }
    if (protocol.specificInstructions && protocol.specificInstructions.trim() !== 'None') {
        newForm.formElements.unshift({
            "elementType": "section",
            "instructions": {
                value: protocol.specificInstructions,
                valueFormat: "html"
            },
            "formElements": []
        });
    }
}