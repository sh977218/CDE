import { isEmpty, uniqBy } from 'lodash';

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
    if (!cdeObj.valueDomain[checkType]) {
        cdeObj.valueDomain[checkType] = {};
    }

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
        if (!s.updated) {
            delete s.updated;
        }
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
    if (fe.question.cde.version) {
        createCdeObj.version = fe.question.cde.version;
    }

    createCdeObj.valueDomain = fixValueDomain(createCdeObj);

    return createCdeObj;
}

async function fixQuestion(questionFe, formObj) {
    questionFe.question.cde.ids.forEach(id => {
        if (isEmpty(id.source) && formObj.stewardOrg.name === 'NCI') {
            id.source = 'caDSR';
        }
    })
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
    /*
        form.designations = fixEmptyDesignation(form.toObject());
        form.sources = fixSources(form.toObject());
        form.properties = fixProperties(form.toObject());
        form.classification = fixClassification(form.toObject());
    */

    form.formElements = await fixFormElements(form.toObject());
}
