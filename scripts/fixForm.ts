import { isEmpty } from 'lodash';
import { Form } from '../server/form/mongo-form';
import { DataElement } from '../server/cde/mongo-cde';

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

async function fixQuestion(fe, form) {
    let cond: any = {tinyId: fe.question.cde.tinyId};
    if (fe.question.cde.version) cond.version = fe.question.cde.version;
    else cond.archived = false;
    let cde = await DataElement.findOne(cond);
    if (!cde) {
        let error = `${form.tinyId} has ${fe.label} ${fe.question.cde.tinyId} not found. `;
        errors.push(error);
        console.log(error);
        process.exit(1);
    } else {
        let cdeObj = cde.toObject();
        let question: any = {
            unitsOfMeasure: fe.question.unitsOfMeasure,
            required: fe.question.required,
            invisible: fe.question.invisible,
            editable: fe.question.editable,
            multiselect: !!fe.question.multiselect,
            answers: fixEmptyAnswer(fe.question.answers),
            defaultAnswer: fe.question.defaultAnswer,
            cde: {
                tinyId: fe.question.cde.tinyId,
                name: fe.question.cde.name,
                version: fe.question.cde.version,
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

function fixEmptyDesignation(form) {
    let formObj = form.toObject();
    form.designations = formObj.designations.filter(d => d.designation);
}

function fixCreatedBy(form) {
    form.createdBy = {
        username: 'nobody'
    };
}

function fixCreated(cde) {
    let defaultDate = new Date();
    defaultDate.setFullYear(1969, 1, 1);
    cde.created = defaultDate;
}

async function fixError(form) {
    if (!form.createdBy) {
        fixCreatedBy(form);
    }
    if (!form.created) {
        fixCreated(form);
    }
    fixEmptyDesignation(form);
    fixSources(form);
    fixProperties(form);

    let formElements = form.toObject().formElements;

    for (let fe of formElements) {
        let elementType = fe.elementType;
        if (elementType === 'question') {
            await fixQuestion(fe, form);
        } else await loopFe(fe, form);
    }

    form.formElements = formElements;
}

(function () {
    let formCount = 0;
    let cursor = Form.find({
        lastMigrationScript: {$ne: 'fixForm'},
        'ids.source': 'PhenX',
        archived: false
    }).cursor();

    cursor.eachAsync(async (form: any) => {
        form.lastMigrationScript = 'fixForm';
        await fixError(form);
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
})();