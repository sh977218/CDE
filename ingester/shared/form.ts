import { isEmpty } from 'lodash';
import { dataElementModel } from 'server/cde/mongo-cde';
import {
    fixClassification, fixCreated, fixCreatedBy, fixEmptyDefinition, fixEmptyDesignation, fixProperties, fixSources
} from 'ingester/shared/utility';
import {
    fixDatatypeDate, fixDatatypeDynamicList, fixDatatypeExternallyDefined, fixDatatypeNumber, fixDatatypeText,
    fixDatatypeTime, fixPermissibleValue
} from 'ingester/shared/de';

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

function fixQuestionDatatype(fe: any) {
    const question: any = {
        multiselect: fe.question.multiselect,
        editable: fe.question.editable,
        required: fe.question.required,
        unitsOfMeasure: fe.question.unitsOfMeasure,
        cde: fe.question.cde,
        answers: [],
        datatype: fe.question.datatype
    };
    const datatype = fe.question.datatype;
    if (datatype === 'Value List') {
        if (!isEmpty(fe.question.answers)) {
            question.answers = fixPermissibleValue(fe.question.answers);
        }
        if (!isEmpty(fe.question.cde.permissibleValues)) {
            question.cde.permissibleValues = fixPermissibleValue(fe.question.cde.permissibleValues);
        }

    } else {
        if (datatype === 'Text') {
            if (!isEmpty(fe.question.datatypeText)) {
                question.datatypeText = fixDatatypeText(fe.question.datatypeText);
            }
        }
        if (datatype === 'Number') {
            if (!isEmpty(fe.question.datatypeNumber)) {
                question.datatypeNumber = fixDatatypeNumber(fe.question.datatypeNumber);
            }
        }
        if (datatype === 'Date') {
            if (!isEmpty(fe.question.datatypeDate)) {
                question.datatypeDate = fixDatatypeDate(fe.question.datatypeDate);
            }
        }
        if (datatype === 'Time') {
            if (!isEmpty(fe.question.datatypeTime)) {
                question.datatypeTime = fixDatatypeTime(fe.question.datatypeTime);
            }
        }
        if (datatype === 'Dynamic List') {
            if (!isEmpty(fe.question.datatypeDynamicList)) {
                question.datatypeDynamicList = fixDatatypeDynamicList(fe.question.datatypeDynamicList);
            }
        }
        if (datatype === 'Externally Defined') {
            if (!isEmpty(fe.question.datatypeExternallyDefined)) {
                question.datatypeExternallyDefined = fixDatatypeExternallyDefined(fe.question.datatypeExternallyDefined);
            }
        }
    }
    fe.question = question;
}

async function fixQuestion(fe: any) {
    if (fe.question.cde.tinyId === undefined) {
        fe.question.cde.tinyId = 'missingTinyId';
        fe.question.cde.ids = fe.question.cde.ids.filter(i => !isEmpty(i.source));
    }
    if (fe.question.cde.tinyId.indexOf('-') !== -1) {
        fe.question.cde.tinyId = fe.question.cde.tinyId.replace(/-/ig, '_');
    }
}

