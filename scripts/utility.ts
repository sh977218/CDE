import { cloneDeep, isEmpty, uniqBy } from 'lodash';
import { DataElement } from 'server/cde/mongo-cde';

// common
export function fixSourceName(cdeObj) {
    cdeObj.sources.forEach(s => {
        if (!s.sourceName) {
            if (cdeObj.stewardOrg.name === 'LOINC' && s.registrationStatus === 'Active') {
                s.sourceName = 'LOINC';
            }
        }
    });
    return cdeObj.sources;
}

export function fixCreated(cde) {
    const defaultDate = new Date();
    defaultDate.setFullYear(1969, 1, 1);
    cde.created = defaultDate;
}

export function fixCreatedBy(cde) {
    cde.createdBy = {
        username: 'nobody'
    };
}

export function fixEmptyDesignation(cdeObj) {
    return cdeObj.designations.filter(d => d.designation);
}

export function fixClassification(eltObj) {
    return uniqBy(eltObj.classification, 'stewardOrg.name');
}

// cde
export function fixValueDomain(cdeObj) {
    if (!cdeObj.valueDomain.permissibleValues) {
        cdeObj.valueDomain.permissibleValues = [];
    }
    if (!cdeObj.valueDomain.datatype) {
        cdeObj.valueDomain.datatype = 'Text';
    }
    const datatype = cdeObj.valueDomain.datatype;
    const myProps = [
        'datatypeText',
        'datatypeNumber',
        'datatypeDate',
        'datatypeTime',
        'datatypeExternallyDefined',
        'datatypeValueList',
        'datatypeDynamicCodeList'
    ];
    let checkType = datatype.replace(/\s+/g, ' ');
    checkType = `datatype${checkType}`;

    if (datatype === 'Text') {
        if (!isEmpty(cdeObj.valueDomain.datatypeText)) {
            cdeObj.valueDomain.datatypeText = fixDatatypeText(cdeObj.valueDomain.datatypeText);
        }
    }
    if (datatype === 'Number') {
        if (!isEmpty(cdeObj.valueDomain.datatypeNumber)) {
            cdeObj.valueDomain.datatypeNumber = fixDatatypeNumber(cdeObj.valueDomain.datatypeNumber);
        }
    }
    if (datatype === 'Value List') {
        if (isEmpty(cdeObj.valueDomain.permissibleValues)) {
            cdeObj.valueDomain.permissibleValues = [{permissibleValue: '5'}];
        }
        cdeObj.valueDomain.permissibleValues = fixEmptyPermissibleValue(cdeObj.valueDomain.permissibleValues);
    }
    myProps.filter(e => e !== checkType).forEach(p => {
        delete cdeObj.valueDomain[p];
    });
    if (!cdeObj.valueDomain[checkType]) { cdeObj.valueDomain[checkType] = {}; }

    return cdeObj.valueDomain;
}

export function fixDatatypeNumber(datatypeNumber) {
    const minValueString = datatypeNumber.minValue;
    const minValue = parseInt(minValueString);
    const maxValueString = datatypeNumber.maxValue;
    const maxValue = parseInt(maxValueString);
    const result: any = {};
    if (!isNaN(minValue)) {
        result.minValue = minValue;
    }
    if (!isNaN(maxValue)) {
        result.maxValue = maxValue;
    }
    return result;
}

export function fixDatatypeText(datatypeText) {
    const minLengthString = datatypeText.minLength;
    const minLength = parseInt(minLengthString);
    const maxLengthString = datatypeText.maxLength;
    const maxLength = parseInt(maxLengthString);
    const result: any = {};
    if (!isNaN(minLength)) {
        result.minLength = minLength;
    }
    if (!isNaN(maxLength)) {
        result.maxLength = maxLength;
    }
    return result;
}

export function fixEmptyPermissibleValue(permissibleValues) {
    const result = [];
    permissibleValues.forEach(pv => {
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

function fixDerivationRules(cdeObj) {
    const derivationRules = [];
    cdeObj.derivationRules.forEach(d => {
        if (!isEmpty(d.inputs)) {
            const inputs = [];
            d.inputs.forEach(input => {
                const underScoreTinyId = input.replace(/-/g, '_');
                inputs.push(underScoreTinyId);
            });
            d.inputs = inputs;
        }
        derivationRules.push(d);
    });
    return derivationRules;
}

export function fixCdeError(cde) {
    if (!cde.createdBy) {
        fixCreatedBy(cde);
    }
    if (!cde.created) {
        fixCreated(cde);
    }
    cde.valueDomain = fixValueDomain(cde.toObject());
    cde.designations = fixEmptyDesignation(cde.toObject());
    cde.sources = fixSourceName(cde.toObject());
    cde.derivationRules = fixDerivationRules(cde.toObject());
    cde.classification = fixClassification(cde.toObject());
}

// form
function fixSources(formObj) {
    formObj.sources.forEach(s => {
        if (!s.updated) { delete s.updated; }
    });
    return formObj.sources.filter(s => !isEmpty(s));
}

function fixProperties(formObj) {
    return formObj.properties.filter(p => !isEmpty(p.value));
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
    if (fe.question.cde.version) { createCdeObj.version = fe.question.cde.version; }

    createCdeObj.valueDomain = fixValueDomain(createCdeObj);

    return createCdeObj;
}

async function fixQuestion(questionFe, formObj) {
    if (formObj.tinyId === 'X17IaQ_NQ' && questionFe.question.cde.tinyId === 'rErbwwAasvz') {
        questionFe.question.cde.version = '3';
    }
    /* @TODO Remove this code after run against test data.
       This fix is to fix form X1FOIySBYl has QkY_BmqoSA that is version '1',
       but in Data Element QkY_BmqoSA version '1' is archived, use version '1.1'
    */
    /*

        if (questionFe.question.cde.tinyId === 'zFTV14_HMhv') {
            questionFe.question.cde.version = '3.1.1';
        }
    */

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

    let cde = await DataElement.findOne(cond);
    if (!cde) {
        console.log(`${formErrorMessage} ${tinyId} not exist. Creating`);
        const createCdeObj = await convertQuestionToCde(cloneDeep(questionFe), formObj.stewardOrg, formObj.registrationState);
        cde = await new DataElement(createCdeObj).save().catch(e => {
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
    if (cde.version) { question.cde.version = cde.version; }

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

async function fixSectionInform(sectionInformFe, formObj) {
    if (sectionInformFe.elementType === 'section' && isEmpty(sectionInformFe.formElements)) {
        delete sectionInformFe.repeatsFor;
        delete sectionInformFe.repeat;
    }
    const formElements = [];
    for (let i = 0; i < sectionInformFe.formElements.length; i++) {
        const fe = sectionInformFe.formElements[i];
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

async function fixFormElements(formObj) {
    const formElements = [];
    for (let i = 0; i < formObj.formElements.length; i++) {
        const fe = formObj.formElements[i];
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

export async function fixFormError(form) {
    if (form.tinyId.indexOf('-') !== -1) {
        form.tinyId = form.tinyId.replace(/-/g, '_');
    }
    if (!form.createdBy) {
        fixCreatedBy(form);
    }
    if (!form.created) {
        fixCreated(form);
    }
    form.designations = fixEmptyDesignation(form.toObject());
    form.sources = fixSources(form.toObject());
    form.properties = fixProperties(form.toObject());
    form.classification = fixClassification(form.toObject());

    form.formElements = await fixFormElements(form.toObject());
}
