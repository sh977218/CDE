import 'server/globals';
import { Model } from 'mongoose';
import {
    DataElementDocument, dataElementDraftModel, dataElementModel, dataElementSourceModel
} from 'server/cde/mongo-cde';
import { CdeFormDocument, formModel, formDraftModel, formSourceModel } from 'server/form/mongo-form';
import { CdeForm, FormElement, FormSectionOrForm } from 'shared/form/form.model';
import { isQuestion } from 'shared/form/fe';

process.on('unhandledRejection', (error) => {
    console.log(error);
});

function fixQuestionInSection(questionFe: any, formObj) {
    questionFe.question.cde.permissibleValues.forEach(pv => {
        copyConcept(pv, formObj);
    })
    questionFe.question.answers.forEach(a => {
        copyConcept(a, formObj);
    })
}

function fixSectionInform(sectionInformFe: FormSectionOrForm, formObj) {
    const formElements: FormElement[] = [];
    for (const fe of sectionInformFe.formElements) {
        if (isQuestion(fe)) {
            fixQuestionInSection(fe, formObj);
            formElements.push(fe);
        } else {
            fe.formElements = fixSectionInform(fe, formObj);
            formElements.push(fe);
        }
    }
    return formElements;
}

function fixFormElements(formObj: CdeForm) {
    const formElements: FormElement[] = [];
    for (const fe of formObj.formElements) {
        if (isQuestion(fe)) {
            fixQuestionInSection(fe, formObj);
            formElements.push(fe);
        } else {
            fe.formElements = fixSectionInform(fe, formObj);
            formElements.push(fe);
        }
    }
    return formElements;
}

async function doOneFormCollection(collection: Model<CdeFormDocument>) {
    const cond = {};
    const cursor = collection.find(cond).cursor();
    return cursor.eachAsync(async form => {
        const formObj = form.toObject() as any;
        form.formElements = fixFormElements(formObj);
        form.markModified('formElements');
        if (formObj.dirty) {
            console.log(`update ${collection.modelName} form tinyId: '${formObj.tinyId}', archived: ${formObj.archived}`);
        }
        await form.save().catch(e => {
            console.log(`${collection.modelName}: ${form.tinyId} has error. ${e}`)
        });
        return;
    });
}

async function doOneDataElementCollection(collection: Model<DataElementDocument>) {
    const cond = {};
    const cursor = collection.find(cond).cursor();
    return cursor.eachAsync(async cde => {
        const cdeObject = cde.toObject() as any;
        if (cdeObject.valueDomain.datatype === 'Value List') {
            cdeObject.valueDomain.permissibleValues.forEach(pv => {
                copyConcept(pv, cdeObject);
            })
            cde.valueDomain = cdeObject.valueDomain;
            if (cdeObject.dirty) {
                console.log(`update ${collection.modelName} CDE tinyId: '${cdeObject.tinyId}', archived: ${cdeObject.archived}`);
            }
            await cde.save().catch(e => {
                console.log(`${collection.modelName} ${cde.tinyId} has error. ${e}`)
            });
        }

        return;
    });
}

function copyConcept(pv, modelObj) {
    if (['UMLS', 'NCI Thesaurus'].includes(pv.codeSystemName?.trim())) {
        pv.conceptSource = pv.codeSystemName ? pv.codeSystemName.trim() : '';
        pv.conceptId = pv.valueMeaningCode ? pv.valueMeaningCode.trim() : '';
        modelObj.dirty = true;
    }
}

function run() {
    // const dataElementTasks = [];
    // const dataElementTasks = [dataElementModel].map(model => doOneDataElementCollection(model));
    const dataElementTasks = [dataElementModel, dataElementDraftModel, dataElementSourceModel].map(model => doOneDataElementCollection(model));

    // const formTasks = [];
    // const formTasks = [formModel].map(model => doOneFormCollection(model));
    const formTasks = [formModel, formDraftModel, formSourceModel].map(model => doOneFormCollection(model));

    const tasks = dataElementTasks.concat(formTasks);

    // Parallel

    Promise.all(tasks).then(() => {
        console.log('done all collections');
        process.exit(0);
    }, err => {
        console.log('err ' + err);
        process.exit(1);
    });

}

run();
