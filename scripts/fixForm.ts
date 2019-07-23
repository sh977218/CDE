import { cloneDeep, isEmpty } from 'lodash';
import { Form } from 'server/form/mongo-form';
import { DataElement } from 'server/cde/mongo-cde';
import {
    fixCdeError, fixClassification, fixCreated, fixCreatedBy, fixEmptyDesignation, fixValueDomain
} from './utility';

process.on('unhandledRejection', function (error) {
    console.log(error);
});

let errors = [];

function fixEmptyAnswer(answers) {
    let result = [];
    answers.forEach(pv => {
        if (!pv.permissibleValue) {
            pv.permissibleValue = pv.valueMeaningName;
        }
        if (!pv.valueMeaningName) {
            pv.valueMeaningName = pv.permissibleValue;
        }
        result.push(pv);
    });
    return result.filter(pv => !isEmpty(pv.permissibleValue));
}

async function convertQuestionToCde(fe, stewardOrg, registrationState) {
    let datatype = fe.question.datatype;
    let createCde: any = {
        tinyId: fe.question.cde.tinyId,
        designations: [{designation: fe.label}],
        registrationState,
        stewardOrg,
        valueDomain: {
            datatype,
            datatypeText: fe.question.datatypeText,
            datatypeNumber: fe.question.datatypeNumber,
            datatypeDate: fe.question.datatypeDate,
            datatypeTime: fe.question.datatypeTime,
            datatypeExternallyDefined: fe.question.datatypeExternallyDefined,
            datatypeValueList: fe.question.datatypeValueList,
            datatypeDynamicCodeList: fe.question.datatypeDynamicCodeList,
            permissibleValues: fe.question.permissibleValues
        }
    };
    if (fe.question.cde.version) createCde.version = fe.question.cde.version;

    createCde.valueDomain = fixValueDomain(createCde);
    fixCreated(createCde);
    fixCreatedBy(createCde);
    let newCde = new DataElement(createCde);
    fixCdeError(newCde);

    let cond: any = {tinyId: fe.question.cde.tinyId};
    if (fe.question.cde.version) cond.version = fe.question.cde.version;
    else cond.archived = false;
    await DataElement.updateOne(cond, createCde, {upsert: true});
    let result = await DataElement.findOne(cond);
    if (!result) {
        process.exit(1);
    }
    return result;
}

async function fixQuestion(fe, form) {
    let cond: any = {tinyId: fe.question.cde.tinyId};
    if (fe.question.cde.version) cond.version = fe.question.cde.version;
    else cond.archived = false;
    let cde = await DataElement.findOne(cond);
    if (!cde) {
        let error = `${form.tinyId} has label '${fe.label}' not found. cond: ${JSON.stringify(cond)}. creating.`;
        console.log(error);
        cde = await convertQuestionToCde(cloneDeep(fe), form.stewardOrg, form.registrationState);
    }
    let cdeObj = cde.toObject();
    let question: any = {
        unitsOfMeasure: fe.question.unitsOfMeasure,
        required: fe.question.required,
        invisible: fe.question.invisible,
        editable: fe.question.editable,
        multiselect: !!fe.question.multiselect,
        answers: fe.question.answers ? fixEmptyAnswer(fe.question.answers) : [],
        defaultAnswer: fe.question.defaultAnswer,
        cde: {
            tinyId: fe.question.cde.tinyId,
            name: fe.question.cde.name,
            version: cde.version,
            ids: cde.ids,
            derivationRules: fe.question.cde.derivationRules
        },
    };
    let valueDomain = cdeObj.valueDomain;

    if (valueDomain === 'Text' && !isEmpty(valueDomain.datatypeText)) {
        question.datatypeText = valueDomain.datatypeText;
    }
    if (valueDomain === 'Number' && !isEmpty(valueDomain.datatypeNumber)) {
        question.datatypeNumber = valueDomain.datatypeNumber;
    }
    if (valueDomain === 'Date' && !isEmpty(valueDomain.datatypeDate)) {
        question.datatypeDate = valueDomain.datatypeDate;
    }
    if (valueDomain === 'Time' && !isEmpty(valueDomain.datatypeTime)) {
        question.datatypeTime = valueDomain.datatypeTime;
    }
    if (valueDomain === 'Dynamic Code List' && !isEmpty(valueDomain.datatypeDynamicCodeList)) {
        question.datatypeDynamicCodeList = valueDomain.datatypeDynamicCodeList;
    }
    if (valueDomain === 'Value List' && !isEmpty(valueDomain.datatypeValueList)) {
        question.cde.permissibleValues = valueDomain.permissibleValues;
    }
    fe.question = question;
}

async function loopFe(formElement, form) {
    if (!formElement.formElements) formElement.formElements = [];

    for (let fe of formElement.formElements) {
        let elementType = fe.elementType;
        if (elementType === 'question') {
            await fixQuestion(fe, form);
        } else await loopFe(fe, form);
    }
}

// Qy4xujzahig no property value.
function fixProperties(form) {
    let formObj = form.toObject();
    form.properties = formObj.properties.filter(p => !isEmpty(p.value));
}

function fixSources(form) {
    let formObj = form.toObject();
    formObj.sources.forEach(s => {
        if (!s.updated) delete s.updated;
    });
    form.sources = formObj.sources.filter(s => !isEmpty(s));
}

async function fixFormError(form) {
    if (!form.createdBy) {
        fixCreatedBy(form);
    }
    if (!form.created) {
        fixCreated(form);
    }
    fixEmptyDesignation(form);
    fixSources(form);
    fixProperties(form);
    form.classification = fixClassification(form.toObject());


    let formElements = form.toObject().formElements;

    for (let fe of formElements) {
        let elementType = fe.elementType;
        if (elementType === 'question') {
            await fixQuestion(fe, form);
        } else await loopFe(fe, form);
    }

    form.formElements = formElements;
}

function run() {
    let formCount = 0;
    let cursor = Form.find({lastMigrationScript: {$ne: 'fixForm'}}).cursor();

    cursor.eachAsync(async (form: any) => {
        form.lastMigrationScript = 'fixForm';
        await fixFormError(form);
        await form.save().catch(error => {
            console.log(`${form.tinyId} ${error}`);
            process.exit(1);
        });
        formCount++;
        console.log(`formCount: ${formCount}`);
    });
    cursor.on('error', e => {
        console.log(e);
        console.log('errors.' + errors);
        process.exit(1);
    });
    cursor.on('close', () => {
        console.log('finished.');
        console.log('errors.' + errors);

        process.exit(0);
    });
}

run();