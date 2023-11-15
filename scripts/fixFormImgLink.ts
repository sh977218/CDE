import { isEmpty } from 'lodash';
import { Model } from 'mongoose';
import { CdeFormDocument, formModel, formSourceModel } from 'server/form/mongo-form';
import { CdeForm, FormElement, FormSectionOrForm } from 'shared/form/form.model';
import { isQuestion } from 'shared/form/fe';

export async function fixFormElements(formObj: CdeForm) {
    const formElements: FormElement[] = [];
    for (const fe of formObj.formElements) {
        fixInstructions(fe);
        if (isQuestion(fe)) {
            formElements.push(fe);
        } else {
            fe.formElements = await fixSectionInform(fe, formObj);
            formElements.push(fe);
        }
    }
    return formElements;
}

function fixInstructions(fe: FormElement) {
    const instructions: any = {};
    if (fe.instructions && !isEmpty(fe.instructions)) {
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

async function fixSectionInform(sectionInformFe: FormSectionOrForm, formObj: CdeForm) {
    const formElements: FormElement[] = [];
    for (const fe of sectionInformFe.formElements) {
        fixInstructions(fe);
        if (isQuestion(fe)) {
            formElements.push(fe);
        } else {
            fe.formElements = await fixSectionInform(fe, formObj);
            formElements.push(fe);
        }
    }
    return formElements;
}

process.on('unhandledRejection', (error) => {
    console.log(error);
});

async function doOneCollection(model: Model<CdeFormDocument>) {
    const cond = {
        archived: false
    };
    const cursor = model.find(cond).cursor();
    let count = 0;
    return cursor.eachAsync(async doc => {
        const form: CdeForm = doc.toObject();
        doc.formElements = await fixFormElements(form);
        await doc.save().catch(error => {
            console.log(`await model.save() Error ${error}`);
        });
        count++;
        console.log(form.elementType + ' count: ' + count);
    });
}

function run() {
    const tasks = [formModel, formSourceModel]
        .map(model => doOneCollection(model));
    Promise.all(tasks).then(() => {
        console.log('done');
        process.exit(0);
    }, err => {
        console.log('err ' + err);
        process.exit(1);
    });
}

run();
