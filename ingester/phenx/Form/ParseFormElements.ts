import { find, isEmpty } from 'lodash';
import { parseFormElements as parseRedcapFormElements } from 'ingester/phenx/redCap/ParseRedCap';
import { parseFormElements as parseLoincFormElements } from 'ingester/loinc/Form/ParseFormElements';
import { map as orgMapping } from 'ingester/loinc/Mapping/ORG_INFO_MAP';

export async function parseFormElements(protocol, attachments, newForm) {
    const loincStandard = find(protocol.standards, standard => standard.Source === 'LOINC');
    if (isEmpty(loincStandard)) {
        await parseRedcapFormElements(protocol, attachments, newForm);
    } else {
        const formElements = await parseLoincFormElements(loincStandard, orgMapping.PhenX, 'PhenX');
        const loinc = loincStandard.loinc;
        if (!loinc['PANEL HIERARCHY']) {
            console.log(`Protocol ${protocol.protocolID} has LOINC ${loinc.loincId} PANEL HIERARCHY is missing.`);
        }
        newForm.formElements = formElements;
    }
    if (protocol.specificInstructions && protocol.specificInstructions.trim() !== 'None') {
        newForm.formElements.unshift({
            elementType: 'section',
            instructions: {
                value: protocol.specificInstructions,
                valueFormat: 'html'
            },
            formElements: []
        });
    }
}