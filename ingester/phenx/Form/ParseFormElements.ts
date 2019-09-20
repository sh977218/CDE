import { find, isEmpty } from 'lodash';
import { parseFormElements as parseRedcapFormElements } from 'ingester/phenx/redCap/ParseRedCap';
import { parseFormElements as parseLoincFormElements } from 'ingester/loinc/Form/ParseFormElements';

export async function parseFormElements(protocol, attachments, newForm, isExistingFormQualified) {
    const loincStandard = find(protocol.standards, standard => standard.Source === 'LOINC');
    if (isEmpty(loincStandard)) {
        await parseRedcapFormElements(protocol, attachments, newForm);
    } else {
        let formElements: any[] = [];
        const loinc = loincStandard.loinc;
        if (isEmpty(loinc['Panel Hierarchy'])) {
            console.log(`Protocol ${protocol.protocolID} has LOINC ${loinc['LOINC Code']} Panel Hierarchy is missing.`);
        } else {
            if (!isExistingFormQualified) {
                formElements = await parseLoincFormElements(loinc, 'PhenX', [protocol.domainCollection]);
            } else {
                formElements = [];
            }
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
