import { groupBy, trim, words } from 'lodash';
import { runOneNichdDataElement } from 'ingester/nichd/csv/loadNichdByXlsx';
import { map as REDCAP_MULTISELECT_MAP } from 'ingester/phenx/redCap/REDCAP_MULTISELECT_MAP';

export async function parseFormElements(nichdForm, nichdRows, source) {
    const nichdSections = groupBy(nichdRows, 'Form Name');
    for (const nichdSectionName in nichdSections) {
        if (nichdSections.hasOwnProperty(nichdSectionName)) {
            const nichdSectionRows = nichdSections[nichdSectionName];
            const formSelection = await parseNichdSection(nichdSectionName, nichdSectionRows, source);
            nichdForm.formElements.push(formSelection);
        }
    }
}

async function parseNichdSection(nichdSectionName, nichdRows, source) {
    const sectionFormElement = {
        elementType: 'section',
        instructions: {value: ''},
        label: nichdSectionName,
        formElements: []
    };
    for (const nichdRow of nichdRows) {
        const existingCde = await runOneNichdDataElement(nichdRow, source);
        const questionFormElement = cdeToQuestion(existingCde, nichdRow);
        sectionFormElement.formElements.push(questionFormElement);
    }
    return sectionFormElement;
}

function cdeToQuestion(cde, nichdRow) {
    if (cde.toObject) {
        cde = cde.toObject();
    }
    const fieldType = trim(nichdRow['Field Type']);
    const validationType = trim(nichdRow['Text Validation Type OR Show Slider Number']);
    const fieldLabel = trim(nichdRow['Field Label']);
    const variableName = trim(nichdRow['Variable / Field Name']);
    const required = trim(nichdRow['Required Field?']) ? trim(nichdRow['Required Field?']) : false;
    const multiselect = REDCAP_MULTISELECT_MAP[fieldType];
    const questionFormElement: any = {
        elementType: 'question',
        label: fieldLabel,
        cardinality: {min: 1, max: 1},
        skipLogic: {
            condition: ''
        },
        question: {
            cde: {
                tinyId: cde.tinyId,
                designations: cde.designations,
                derivationRules: cde.derivationRules,
                name: fieldLabel.length === 0 ? words(variableName.replace(/_/g, ' ')) : fieldLabel,
                ids: cde.ids ? cde.ids : [],
                permissibleValues: cde.valueDomain.permissibleValues
            },
            datatype: cde.valueDomain.datatype,
            required,
            multiselect,
            unitsOfMeasure: cde.valueDomain.uom ? [{system: '', code: cde.valueDomain.uom}] : [],
            answers: cde.valueDomain.permissibleValues
        }
    };
    if (cde.version) {
        questionFormElement.question.cde.version = cde.version;
    }
    if (validationType === 'notes') {
        questionFormElement.question.datatypeText.showAsTextArea = true;
    }
    return questionFormElement;
}
