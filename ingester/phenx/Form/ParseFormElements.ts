import { find, isEmpty } from 'lodash';
import { parseFormElements as parseRedcapFormElements } from 'ingester/phenx/redCap/ParseRedCap';
import { parseFormElements as parseLoincFormElements } from 'ingester/loinc/Form/ParseFormElements';
import { map as orgMapping } from 'ingester/loinc/Mapping/ORG_INFO_MAP';

export async function parseFormElements(protocol, attachments, newForm) {
    let loinc = find(protocol.standards, standard => standard.Source === 'LOINC');
    if (isEmpty(loinc)) {
        console.log('red cap');
        await parseRedcapFormElements(protocol, attachments, newForm);
    } else {
        let formElements = await parseLoincFormElements(loinc, orgMapping['PhenX']);
        newForm.formElements = formElements;
        console.log('skip loinc');
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