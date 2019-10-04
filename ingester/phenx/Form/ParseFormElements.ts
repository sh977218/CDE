import { find, isEmpty } from 'lodash';
import { parseFormElements as parseRedcapFormElements } from 'ingester/phenx/redCap/ParseRedCap';
import { parseFormElements as parseLoincFormElements } from 'ingester/loinc/Form/ParseFormElements';

export async function parseFormElements(protocol, attachments, newForm, isExistingFormQualified) {
    let formElements: any[] = [];
    if (isExistingFormQualified) {
        newForm.formElements = formElements;
    } else {
        const loincStandard = find(protocol.standards, standard => standard.Source === 'LOINC');
        if (isEmpty(loincStandard)) {
            await parseRedcapFormElements(protocol, attachments, newForm);
        } else {
            const loinc = loincStandard.loinc;
            if (isEmpty(loinc['Panel Hierarchy'])) {
                console.log(`Protocol ${protocol.protocolID} has LOINC ${loinc['LOINC Code']} Panel Hierarchy is missing.`);
            } else {
                formElements = await parseLoincFormElements(loinc, 'PhenX', [protocol.domainCollection]);
            }
            newForm.formElements = formElements;
        }
    }

    if (protocol.specificInstructions && protocol.specificInstructions.trim() !== 'None') {
        const instructionFormElement = {
            elementType: 'section',
            instructions: {
                value: protocol.specificInstructions,
                valueFormat: 'html'
            },
            formElements: []
        };
        if (isEmpty(newForm.formElements)) {
            newForm.formElements.unshift(instructionFormElement);
        } else {
            newForm.formElements[0].instructions = {
                value: protocol.specificInstructions,
                valueFormat: 'html'
            };
        }
    }
}
