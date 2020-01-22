import { cloneDeep, isEmpty } from 'lodash';
import { dataElementModel } from 'server/cde/mongo-cde';
import { fixDerivationRules, fixEmptyPermissibleValue, fixValueDomain } from 'ingester/shared/de';
import { fixClassification, fixEmptyDesignation, fixProperties, fixSources } from 'ingester/shared/utility';

async function fixFormElements(formObj) {
    const formElements = [];
    for (const fe of formObj.formElements) {
        fixInstructions(fe);
        const elementType = fe.elementType;
        if (elementType === 'question') {
            if (fe.question.cde.tinyId.indexOf('-') !== -1) {
                fe.question.cde.tinyId = fe.question.cde.tinyId.replace(/-/g, '_');
            }
            const fixFe = await fixQuestion(fe, formObj);
            formElements.push(fixFe);
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

async function fixSectionInform(sectionInformFe, formObj) {
    if (sectionInformFe.elementType === 'section' && isEmpty(sectionInformFe.formElements)) {
        delete sectionInformFe.repeatsFor;
        delete sectionInformFe.repeat;
    }
    const formElements = [];
    for (const fe of sectionInformFe.formElements) {
        const elementType = fe.elementType;
        if (elementType === 'question') {
            if (fe.question.cde.tinyId.indexOf('-') !== -1) {
                fe.question.cde.tinyId = fe.question.cde.tinyId.replace(/-/g, '_');
            }
            const fixFe = await fixQuestion(fe, formObj);
            formElements.push(fixFe);
        } else {
            fe.formElements = await fixSectionInform(fe, formObj);
            formElements.push(fe);
        }
    }
    return formElements;
}

async function fixQuestion(questionFe, formObj) {

    const tinyId = questionFe.question.cde.tinyId;
    let version = null;
    if (questionFe.question.cde.version) {
        version = questionFe.question.cde.version;
    }
    if (tinyId.indexOf('-') !== -1) {
        throw new Error(`cde tinyId is contains -`);
        process.exit(1);
    }
    const label = questionFe.label;
    const formErrorMessage = `form ${formObj.tinyId} version ${formObj.version} archived ${formObj.archived} has question '${label}'`;
    if (!tinyId) {
        throw new Error(`cde tinyId is null ${formObj.tinyId} ${label}`);
        process.exit(1);
    }
    const cond: any = {tinyId};
    if (version) {
        cond.version = version;
    } else {
        cond.archived = false;
    }

    let cde = await dataElementModel.findOne(cond);
    if (!cde) {
        console.log(`${formErrorMessage} ${tinyId} not exist. Creating`);
        const createCdeObj = await convertQuestionToCde(cloneDeep(questionFe), formObj.stewardOrg, formObj.registrationState);
        cde = await new dataElementModel(createCdeObj).save().catch(e => {
            console.log(`mongo cond: ${JSON.stringify(cond)}`);
            throw new Error(`await new DataElement(cdeObj).save() Error ` + e);
        });
    } else {
        cde = await cde.save().catch(error => {
            throw new Error(`await cde.save() Error on ${cde.tinyId} ${error}`);
        });
    }
    const cdeObj = cde.toObject();
    if (isEmpty(cdeObj.valueDomain.datatype)) {
        console.log(cdeObj.tinyId + 'datatype empty.');
        process.exit(1);
    }
    const question: any = {
        datatype: cdeObj.valueDomain.datatype,
        required: questionFe.question.required,
        invisible: questionFe.question.invisible,
        editable: questionFe.question.editable,
        unitsOfMeasure: questionFe.question.unitsOfMeasure,
        defaultAnswer: questionFe.question.defaultAnswer,
        cde: {
            tinyId: cde.tinyId,
            name: questionFe.question.cde.name,
            ids: cde.ids,
            derivationRules: fixDerivationRules(questionFe.question.cde)
        },
    };
    if (cde.version) {
        question.cde.version = cde.version;
    }

    const valueDomain = cdeObj.valueDomain;
    const datatype = valueDomain.datatype;

    if (datatype === 'Text') {
        if (!isEmpty(valueDomain.datatypeText)) {
            question.datatypeText = valueDomain.datatypeText;
        }
        if (!isEmpty(questionFe.question.datatypeText)) {
            question.datatypeText = questionFe.question.datatypeText;
        }
    }
    if (datatype === 'Number') {
        if (!isEmpty(valueDomain.datatypeNumber)) {
            question.datatypeNumber = valueDomain.datatypeNumber;
        }
        if (!isEmpty(questionFe.question.datatypeNumber)) {
            question.datatypeNumber = questionFe.question.datatypeNumber;
        }
    }
    if (datatype === 'Date') {
        if (!isEmpty(valueDomain.datatypeDate)) {
            question.datatypeDate = valueDomain.datatypeDate;
        }
        if (!isEmpty(questionFe.question.datatypeDate)) {
            question.datatypeDate = questionFe.question.datatypeDate;
        }
    }
    if (datatype === 'Time') {
        if (!isEmpty(valueDomain.datatypeTime)) {
            question.datatypeTime = valueDomain.datatypeTime;
        }
        if (!isEmpty(questionFe.question.datatypeTime)) {
            question.datatypeTime = questionFe.question.datatypeTime;
        }
    }
    if (datatype === 'Dynamic Code List') {
        if (!isEmpty(valueDomain.datatypeDynamicCodeList)) {
            question.datatypeDynamicCodeList = valueDomain.datatypeDynamicCodeList;
        }
        if (!isEmpty(questionFe.question.datatypeDynamicCodeList)) {
            question.datatypeDynamicCodeList = questionFe.question.datatypeDynamicCodeList;
        }
    }
    if (datatype === 'Value List') {
        if (isEmpty(valueDomain.permissibleValues)) {
            throw new Error(`cde tinyId ${cdeObj.tinyId} is value list, empty permissible values.`);
            process.exit(1);
        }
        question.multiselect = !!questionFe.question.multiselect;
        question.answers = questionFe.question.answers ? fixEmptyPermissibleValue(questionFe.question.answers) : [];

        if (!isEmpty(valueDomain.permissibleValues)) {
            question.cde.permissibleValues = valueDomain.permissibleValues;
        }
        if (!isEmpty(valueDomain.datatypeValueList)) {
            question.datatypeValueList = valueDomain.datatypeValueList;
        }
    }
    questionFe.question = question;
    return questionFe;
}

async function convertQuestionToCde(fe, stewardOrg, registrationState) {
    const datatype = fe.question.datatype;
    const createCdeObj: any = {
        tinyId: fe.question.cde.tinyId,
        archived: false,
        designations: [{designation: fe.label}],
        registrationState,
        stewardOrg,
        createdBy: {
            username: 'nobody'
        },
        created: new Date(),
        valueDomain: {
            datatype,
            datatypeText: fe.question.datatypeText,
            datatypeNumber: fe.question.datatypeNumber,
            datatypeDate: fe.question.datatypeDate,
            datatypeTime: fe.question.datatypeTime,
            datatypeExternallyDefined: fe.question.datatypeExternallyDefined,
            datatypeValueList: fe.question.datatypeValueList,
            datatypeDynamicCodeList: fe.question.datatypeDynamicCodeList,
            permissibleValues: fe.question.cde.permissibleValues
        }
    };
    if (fe.question.cde.version) {
        createCdeObj.version = fe.question.cde.version;
    }

    createCdeObj.valueDomain = fixValueDomain(createCdeObj);

    return createCdeObj;
}

export async function fixFormError(form) {
    const formObj = form.toObject();

    form.designations = fixEmptyDesignation(formObj);
    form.sources = fixSources(formObj);
    form.properties = fixProperties(formObj);
    form.classification = fixClassification(formObj);

    form.formElements = await fixFormElements(formObj);
}

