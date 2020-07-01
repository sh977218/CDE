import { groupBy } from 'lodash';
import { runOneNichdDataElement } from 'ingester/nichd/csv/loadNichdByXlsx';

export async function parseFormElements(nichdForm, nichdRows) {
    const nichdSections = groupBy(nichdRows, 'Form Name');
    for (const nichdSectionName in nichdSections) {
        if (nichdSections.hasOwnProperty(nichdSectionName)) {
            const nichdSectionRows = nichdSections[nichdSectionName];
            const formSelection = await parseNichdSection(nichdSectionName, nichdSectionRows);
            nichdForm.formElements.push(formSelection);
        }
    }
}

async function parseNichdSection(nichdSectionName, nichdRows) {
    const formElement = {
        elementType: 'section',
        instructions: {value: ''},
        label: nichdSectionName,
        formElements: []
    };
    for (const nichdRow of nichdRows) {
        let nichdCdeObj = await runOneNichdDataElement(nichdRow);
    }
}
