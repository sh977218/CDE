import {groupBy, isEmpty, trim, words} from 'lodash';
import {map as REDCAP_MULTISELECT_MAP} from 'ingester/phenx/redCap/REDCAP_MULTISELECT_MAP';
import {NichdConfig} from 'ingester/nichd/shared/utility';
import {createNichdCde, loadNichdRow, loadNichdRowWithLoinc, loadNichdRowWithNlm} from 'ingester/nichd/csv/cde/cde';
import {replaceDashAndCapitalize, updateRawArtifact} from 'ingester/shared/utility';
import {loadLoincById} from 'ingester/loinc/website/newSite/loincLoader';

let allDeCount = 0;
let nlmDeCount = 0
let loincDeCount = 0;
let nichdDeCount = 0;

export async function parseFormElements(nichdForm: any, nichdRows: any[], config: NichdConfig) {
    const nichdSections = groupBy(nichdRows, 'Form Name');
    for (const nichdSectionName in nichdSections) {
        if (nichdSections.hasOwnProperty(nichdSectionName)) {
            const nichdSectionRows = nichdSections[nichdSectionName];
            const formattedNichdSectionName = replaceDashAndCapitalize(nichdSectionName);
            const formSelection = await parseNichdSection(formattedNichdSectionName, nichdSectionRows, config);
            nichdForm.formElements.push(formSelection);
        }
    }
}

async function parseNichdSection(nichdSectionName: string, nichdRows: any[], config: NichdConfig) {
    const sectionFormElement: any = {
        elementType: 'section',
        instructions: {value: ''},
        label: nichdSectionName,
        formElements: []
    };

    const variableMapping: any = {};
    for (const nichdRow of nichdRows) {
        const variableName = nichdRow['Variable / Field Name'];
        if (variableMapping[variableName]) {
            console.log(`duplicated variableName: ${variableName}`);
            process.exit(1);
        } else {
            variableMapping[variableName] = true;
        }
        allDeCount++;
        const nlmId = trim(nichdRow['NLM ID']);
        const loincId = trim(nichdRow.LOINC);
        let existingCde;
        const newCdeObj = createNichdCde(nichdRow, config);
        if (!isEmpty(nlmId)) {
            nlmDeCount++;
            existingCde = await loadNichdRowWithNlm(nichdRow, config);
        } else if (!isEmpty(loincId)) {
            loincDeCount++;
            let existingLoinc: any = await LoincModel.findOne({'LOINC Code': loincId});
            if (isEmpty(existingLoinc)) {
                const loinc = await loadLoincById(loincId);
                existingLoinc = await new LoincModel(loinc).save();
            }
            const existingLoincObj = existingLoinc.toObject();
            const basicAttributes = existingLoincObj['Basic Attributes']
            if (basicAttributes && basicAttributes.Type === 'Surveys') {
                existingCde = await loadNichdRow(nichdRow, config);
            } else {
                existingCde = await loadNichdRowWithLoinc(nichdRow, config)
            }
        } else {
            nichdDeCount++;
            existingCde = await loadNichdRow(nichdRow, config);
        }
        await updateRawArtifact(existingCde, newCdeObj, config.source, config.classificationOrgName);
        const questionFormElement = cdeToQuestion(existingCde, nichdRow);
        sectionFormElement.formElements.push(questionFormElement);
    }
    console.log(`allDeCount: ${allDeCount}`);
    console.log(`nlmDeCount: ${nlmDeCount}`);
    console.log(`loincDeCount: ${loincDeCount}`);
    console.log(`nichdDeCount: ${nichdDeCount}`);
    return sectionFormElement;
}

function cdeToQuestion(cde: any, nichdRow: any) {
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
