import {DEFAULT_RADX_UP_CONFIG} from 'ingester/phenx/Shared/utility';
import {groupBy, isEmpty, words} from 'lodash';
import {map as REDCAP_MULTISELECT_MAP} from 'ingester/phenx/redCap/REDCAP_MULTISELECT_MAP';
import {doOnePhenXCde} from 'ingester/phenx/csv/cde/cde';

export async function parseFormElements(form, rows: any[], config = DEFAULT_RADX_UP_CONFIG) {
    const sectionNames = groupBy(rows, 'Form Name');
    for (const sectionName in sectionNames) {
        if (sectionNames.hasOwnProperty(sectionName)) {
            /*
                        if (sectionName === 'location') {
                            const sectionRows = sectionNames[sectionName];
                            const formSelection = await parseSection(sectionName, sectionRows, config);
                            form.formElements.push(formSelection);
                        }
            */
//                        console.log(`Form Name: ${sectionName}`)
            const sectionRows = sectionNames[sectionName];
            const formSelection = await parseSection(sectionName, sectionRows, config);
            form.formElements.push(formSelection);
        }
    }
}

async function parseSection(sectionName: string, rows: any[], config = DEFAULT_RADX_UP_CONFIG) {
    const sectionHeaderRow = rows.filter(r => !isEmpty(r['Section Header']))[0];
    let label = sectionName;
    if (!isEmpty(sectionHeaderRow) && !isEmpty(sectionHeaderRow['Section Header'])) {
        label = sectionHeaderRow['Section Header'];
    }
    const sectionFormElement = {
        elementType: 'section',
        instructions: {value: ''},
        label,
        formElements: []
    };
    for (const row of rows) {
        if (row['Field Type'] !== 'descriptive') {
            const existingCde = await doOnePhenXCde(row, config);
            const questionFormElement = cdeToQuestion(existingCde, row);
            sectionFormElement.formElements.push(questionFormElement);
        }
    }
    return sectionFormElement;
}

function cdeToQuestion(cde, row) {
    if (cde.toObject) {
        cde = cde.toObject();
    }
    const fieldType = row['Field Type'];
    const validationType = row['Text Validation Type OR Show Slider Number'];
    const fieldLabel = row['Field Label'];
    const variableName = row['Variable / Field Name'];
    const required = row['Required Field?'] ? row['Required Field?'] : false;
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
                name: !isEmpty(fieldLabel) ? words(variableName.replace(/_/g, ' ')) : fieldLabel,
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
