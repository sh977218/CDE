import {isEmpty} from 'lodash';

export async function fixFormElements(formObj) {
    const formElements = [];
    for (const fe of formObj.formElements) {
        fixInstructions(fe);
        const elementType = fe.elementType;
        if (elementType === 'question') {
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
            instructions.value = fe.instructions.value.replace(/src="\/data\//ig, 'src="/server/system/data/');
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

async function fixSectionInform(sectionInformFe, formObj) {
    const formElements = [];
    for (const fe of sectionInformFe.formElements) {
        fixInstructions(fe);
        const elementType = fe.elementType;
        if (elementType === 'question') {
            formElements.push(fe);
        } else {
            fe.formElements = await fixSectionInform(fe, formObj);
            formElements.push(fe);
        }
    }
    return formElements;
}
