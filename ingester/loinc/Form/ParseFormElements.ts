import { map as CARDINALITY_MAP } from 'ingester/loinc/Mapping/LOINC_CARDINALITY_MAP';
import { map as MULTISELECT_MAP } from 'ingester/loinc/Mapping/LOINC_MULTISELECT_MAP';
import { map as REQUIRED_MAP } from 'ingester/loinc/Mapping/LOINC_REQUIRED_MAP';
import { runOneCde } from 'ingester/loinc/LOADER/loincCdeLoader';
import { runOneForm } from 'ingester/loinc/LOADER/loincFormLoader';
import { dataElementModel } from 'server/cde/mongo-cde';
import { formModel } from 'server/form/mongo-form';
import { fixValueDomainOrQuestion, sortProp, sortRefDoc } from 'ingester/shared/utility';

export async function parseFormElements(loinc, classificationOrgName, classificationArray) {
    const panelHierarchy = loinc['Panel Hierarchy'];
    if (!panelHierarchy) {
        console.log(`${loinc['LOINC Code']} does not have panelHierarchy`);
        process.exit(1);
    }
    const elements = panelHierarchy.elements;
    if (!elements) {
        console.log(`${loinc['LOINC Code']} has panelHierarchy, but not elements found inside panelHierarchy.`);
        process.exit(1);
    }

    const formElements: any[] = [];
    console.log(`LOINC Form ${loinc['LOINC Code']} has ${elements.length} elements to process.`);
    let tempFormElements = formElements;
    const needOuterSection = elements.filter(element => element.elements.length > 0).length === 0;
    if (needOuterSection) {
        formElements.push({
            elementType: 'section',
            label: '',
            instructions: {
                value: ''
            },
            formElements: []
        });
        tempFormElements = formElements[0].formElements;
    }

    for (const element of elements) {
        const isElementForm = element.elements.length > 0;
        if (isElementForm) {
            const formElement = await loadForm(element, classificationOrgName, classificationArray);
            tempFormElements.push(formElement);
        } else {
            const formElement = await loadCde(element, classificationOrgName, classificationArray);
            tempFormElements.push(formElement);
        }
    }
    return formElements;
}

function elementToQuestion(existingCde, element) {
    const question: any = {
        instructions: {value: ''},
        cde: {
            tinyId: existingCde.tinyId,
            name: existingCde.designations[0].designation,
            permissibleValues: existingCde.valueDomain.permissibleValues,
            ids: existingCde.ids
        },
        required: REQUIRED_MAP[element.Cardinality],
        multiselect: MULTISELECT_MAP[element.Cardinality],
        datatype: existingCde.valueDomain.datatype,
        answers: existingCde.valueDomain.permissibleValues,
        unitsOfMeasure: [],
    };

    if (existingCde.version) {
        question.cde.version = existingCde.version;
    }
    if (question.datatype === 'Text') {
        question.multiselect = false;
    }
    if (element.exUcumUnitsText) {
        const uom: any = {system: '', code: element['Example UCUM Units']};
        question.unitsOfMeasure.push(uom);
    }
    return {
        elementType: 'question',
        instructions: {},
        cardinality: CARDINALITY_MAP[element.Cardinality],
        label: element.Name.trim(),
        question,
        formElements: []
    };
}

async function loadCde(element, classificationOrgName, classificationArray) {
    // @TODO remove after this load
    const cdeToFix: any = await dataElementModel.findOne({archived: false, 'ids.id': element.loinc['LOINC Code']});
    if (cdeToFix) {
        fixValueDomainOrQuestion(cdeToFix.valueDomain);
        await cdeToFix.save();
    }
    const existingCde = await runOneCde(element.loinc, classificationOrgName, classificationArray);
    return elementToQuestion(existingCde, element);
}

function elementToInForm(existingForm, element) {
    const inForm: any = {
        form: {
            tinyId: existingForm.tinyId,
            name: existingForm.designations[0].designation
        }
    };
    if (existingForm.version) {
        inForm.form.version = existingForm.version;
    }

    return {
        elementType: 'form',
        instructions: {value: '', valueFormat: ''},
        cardinality: CARDINALITY_MAP[element.Cardinality],
        label: element.Name.trim(),
        inForm,
        formElements: []
    };
}

async function loadForm(element, classificationOrgName, classificationArray) {
    // @TODO remove after this load
    const formToFix: any = await formModel.findOne({archived: false, 'ids.id': element.loinc['LOINC Code']});
    if (formToFix) {
        sortRefDoc(formToFix);
        sortProp(formToFix);
        await formToFix.save();
    }


    const existingForm = await runOneForm(element.loinc, classificationOrgName, classificationArray);
    return elementToInForm(existingForm, element);
}
