import { isEmpty } from 'lodash';
import { dataElementModel } from 'server/cde/mongo-cde';
import {
    fixClassification, fixEmptyDefinition, fixEmptyDesignation, fixProperties, fixSources
} from 'ingester/shared/utility';


async function fixFormElements(formObj) {
    const formElements = [];
    for (const fe of formObj.formElements) {
        fixInstructions(fe);
        const elementType = fe.elementType;
        if (elementType === 'question') {
            await fixQuestion(fe);
            formElements.push(fe);
        } else {
            fe.formElements = await fixSectionInform(fe, formObj);
            formElements.push(fe);
        }
    }
    return formElements;
}


function fixInstructions(fe: any) {
    const instructions: any = {};
    if (!isEmpty(fe.instructions)) {
        if (!isEmpty(fe.instructions.value)) {
            instructions.value = fe.instructions.value;
        }
        if (!isEmpty(fe.instructions.valueFormat)) {
            instructions.valueFormat = fe.instructions.valueFormat;
        }
    }
    if (!isEmpty(instructions)) {
        fe.instructions = instructions;
    } else {
        delete fe.instructions;
    }
}

const nameTinyIdMap = {
    'Generalized Anxiety Disorder (GAD-7) - feeling nervous scale': 'm1ufksx5W',
    'Generalized Anxiety Disorder (GAD-7) - not stop worry scale': 'myeOG1jx9Z',
    'Patient Health Questionnaire (PHQ) - Feeling failure score': 'QkIo3YfIyX',
    'Rey Auditory Verbal Learning Test (RAVLT) - Correct recall trial total count': 'Q1G8Pkix9Z',
    'Rey Auditory Verbal Learning Test (RAVLT) - Correct recall trial A1-5 total count': 'Qy78PJoe9W',
    'Rey Auditory Verbal Learning Test (RAVLT) - Trial number': 'QkV8wJjec_',
    'Rey Auditory Verbal Learning Test (RAVLT) - Word list type': 'XyH8wyil5W',
    'Rey Auditory Verbal Learning Test (RAVLT) - Word list A type': 'myU8v1ie9Z',
    'Rey Auditory Verbal Learning Test (RAVLT) - Word list B type': 'Qyv8wkjg9_',
    'Rey Auditory Verbal Learning Test (RAVLT) - Word correct recall indicator': 'XkuIDJiecZ',
    'Vascular partial pressure carbon dioxide transcutaneous increase greater than 15 mmHg indicator': '7JjMwDJie9W',
    'Pittsburgh Sleep Quality Index (PSQI) - Cannot breathe comfortably past month scale': 'Q1yWiFJil9Z',
    'Imaging tissue integrity normal appearing white matter measurement indicator': 'Q1czVhJsg5Z',
    'Imaging tissue integrity other regional measurements indicator': 'JwbH7OtcWAF',
    'Optical coherence tomography (OCT) time-domain performed indicator': 'Qk2fuh1sgc_',
    'Imaging follow-up scan indicator': 'mkxZ3hkigcZ'


};

async function fixQuestion(fe: any) {
    if (fe.question.cde.tinyId === undefined) {
        const foundCdes = await dataElementModel.find({
            'designations.designation': fe.question.cde.name,
            ids: {$elemMatch: fe.question.cde.ids[0]}
        });
        if (foundCdes.length === 0) {
            console.log('a');
        } else {
            fe.question.cde.tinyId = foundCdes[0].tinyId;
        }
    }
    if (fe.question.cde.tinyId.indexOf('-') !== -1) {
        fe.question.cde.tinyId = fe.question.cde.tinyId.replace(/-/ig, '_');
    }
}

async function fixSectionInform(sectionInformFe, formObj) {
    const formElements = [];
    for (const fe of sectionInformFe.formElements) {
        fixInstructions(fe);
        const elementType = fe.elementType;
        if (elementType === 'question') {
            await fixQuestion(fe);
            formElements.push(fe);
        } else {
            fe.formElements = await fixSectionInform(fe, formObj);
            formElements.push(fe);
        }
    }
    return formElements;
}

export async function fixFormError(form) {
    const formObj = form.toObject();

    form.designations = fixEmptyDesignation(formObj);
    form.definitions = fixEmptyDefinition(formObj);
    form.sources = fixSources(formObj);
    form.properties = fixProperties(formObj);
    form.classification = fixClassification(formObj);

    form.formElements = await fixFormElements(formObj);
}

