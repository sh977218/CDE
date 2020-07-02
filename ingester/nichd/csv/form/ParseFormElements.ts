import { groupBy, trim } from 'lodash';
import { runOneNichdDataElement } from 'ingester/nichd/csv/loadNichdByXlsx';
import { dataElementModel } from 'server/cde/mongo-cde';

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
    const sectionFormElement = {
        elementType: 'section',
        instructions: {value: ''},
        label: nichdSectionName,
        formElements: []
    };
    for (const nichdRow of nichdRows) {
        const nlmId = trim(nichdRow.shortID);
        await runOneNichdDataElement(nichdRow);
        const cond = {
            archived: false,
            tinyId: nlmId,
            'registrationState.registrationStatus': {$ne: 'Retired'}
        };
        const existingCde = await dataElementModel.findOne(cond);
        const questionFormElement = cdeToQuestion(existingCde);
        sectionFormElement.formElements.push(questionFormElement);
    }

    return sectionFormElement;
}

function cdeToQuestion(cde) {
    return {};
}
