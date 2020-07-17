import { isEmpty } from 'lodash';
import { formModel, formSourceModel } from 'server/form/mongo-form';

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

process.on('unhandledRejection', (error) => {
    console.log(error);
});

async function doOneCollection(model) {
    const cond = {
        archived: false
    };
    const cursor = model.find(cond).cursor();
    let count = 0;
    return cursor.eachAsync(async model => {
        const modelObj = model.toObject();
        model.formElements = await fixFormElements(modelObj);
        await model.save().catch(error => {
            console.log(`await model.save() Error ${error}`);
        });
        count++;
        console.log(modelObj.elementType + ' count: ' + count);
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
