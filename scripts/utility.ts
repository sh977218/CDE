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
    let defaultDate = new Date();
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

export function fixClassification(cdeObj) {
    return uniqBy(cdeObj.classification, 'stewardOrg.name');
}

// cde
export function fixValueDomain(cdeObj) {
    if (!cdeObj.valueDomain.permissibleValues) {
        cdeObj.valueDomain.permissibleValues = [];
    }
    if (!cdeObj.valueDomain.datatype) {
        cdeObj.valueDomain.datatype = 'Text';
    }
    let datatype = cdeObj.valueDomain.datatype;
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
        if (!cdeObj.valueDomain.permissibleValues) {
            cdeObj.valueDomain.permissibleValues = [{permissibleValue: '5'}];
        }
        cdeObj.valueDomain.permissibleValues = fixEmptyPermissibleValue(cdeObj.valueDomain.permissibleValues);
    }
    myProps.filter(e => e !== checkType).forEach(p => {
        delete cdeObj.valueDomain[p];
    });
    if (!cdeObj.valueDomain[checkType]) cdeObj.valueDomain[checkType] = {};

    return cdeObj.valueDomain;
}

export function fixDatatypeNumber(datatypeNumber) {
    let minValueString = datatypeNumber.minValue;
    let minValue = parseInt(minValueString);
    let maxValueString = datatypeNumber.maxValue;
    let maxValue = parseInt(maxValueString);
    let result: any = {};
    if (!isNaN(minValue)) {
        result.minValue = minValue;
    }
    if (!isNaN(maxValue)) {
        result.maxValue = maxValue;
    }
    return result;
}

export function fixDatatypeText(datatypeText) {
    let minLengthString = datatypeText.minLength;
    let minLength = parseInt(minLengthString);
    let maxLengthString = datatypeText.maxLength;
    let maxLength = parseInt(maxLengthString);
    let result: any = {};
    if (!isNaN(minLength)) {
        result.minLength = minLength;
    }
    if (!isNaN(maxLength)) {
        result.maxLength = maxLength;
    }
    return result;
}

export function fixEmptyPermissibleValue(permissibleValues) {
    let result = [];
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
    cde.classification = fixClassification(cde.toObject());
}

// form
function fixSources(formObj) {
    formObj.sources.forEach(s => {
        if (!s.updated) delete s.updated;
    });
    return formObj.sources.filter(s => !isEmpty(s));
}

function fixProperties(formObj) {
    return formObj.properties.filter(p => !isEmpty(p.value));
}

async function convertQuestionToCde(fe, stewardOrg, registrationState) {
    let datatype = fe.question.datatype;
    let createCdeObj: any = {
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
            permissibleValues: fe.question.permissibleValues
        }
    };
    if (fe.question.cde.version) createCdeObj.version = fe.question.cde.version;

    createCdeObj.valueDomain = fixValueDomain(createCdeObj);

    return createCdeObj;
}

async function fixQuestion(questionFe, formObj) {
    let tinyId = questionFe.question.cde.tinyId;
    let version = questionFe.question.cde.version;
    let label = questionFe.label;
    let formErrorMessage = `${formObj.tinyId} has question '${label}'`;
    if (!tinyId) {
        throw `cde tinyId is null ${formObj.tinyId} ${label}`;
        process.exit(1);
    }
    let cond: any = {tinyId, version, archived: false};

    let cde = await DataElement.findOne(cond);
    if (!cde) {
        console.log(`${formErrorMessage} ${tinyId} not exist. Creating`);
        let createCdeObj = await convertQuestionToCde(cloneDeep(questionFe), formObj.stewardOrg, formObj.registrationState);
        cde = await new DataElement(createCdeObj).save().catch(e => {
            throw `await new DataElement(cdeObj).save() Error ` + e;
        });
    }
    let cdeObj = cde.toObject();
    let question: any = {
        unitsOfMeasure: questionFe.question.unitsOfMeasure,
        required: questionFe.question.required,
        invisible: questionFe.question.invisible,
        editable: questionFe.question.editable,
        multiselect: !!questionFe.question.multiselect,
        answers: questionFe.question.answers ? fixEmptyPermissibleValue(questionFe.question.answers) : [],
        defaultAnswer: questionFe.question.defaultAnswer,
        cde: {
            tinyId: questionFe.question.cde.tinyId,
            name: questionFe.question.cde.name,
            ids: cde.ids,
            derivationRules: questionFe.question.cde.derivationRules
        },
    };
    if (cde.version) question.cde.version = cde.version;

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
    questionFe.question = question;
    return questionFe;
}

async function fixSectionInform(sectionInformFe, formObj) {
    let formElements = [];
    for (let fe of sectionInformFe.formElements) {
        let elementType = fe.elementType;
        if (elementType === 'question') {
            let fixFe = await fixQuestion(fe, formObj);
            formElements.push(fixFe);
        } else {
            fe.formElements = await fixSectionInform(fe, formObj);
            formElements.push(fe);
        }
    }
    return formElements;
}

async function fixFormElements(formObj) {
    let formElements = [];
    for (let fe of formObj.formElements) {
        let elementType = fe.elementType;
        if (elementType === 'question') {
            let fixFe = await fixQuestion(fe, formObj);
            formElements.push(fixFe);
        } else {
            fe.formElements = await fixSectionInform(fe, formObj);
            formElements.push(fe);
        }
    }
    return formElements;
}

export async function fixFormError(form) {
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

    form.formElements = fixFormElements(form.toObject());
}
