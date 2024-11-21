import {dataElementModel} from "server/cde/mongo-cde";
import {isEmpty} from "lodash";

export async function parseFormElements(nciXmlForm) {
    const headerSection = {
        label: nciXmlForm.headerInstruction.text,
        elementType: 'section',
        formElements: []
    }
    const section = {
        label: nciXmlForm.module.instruction.text,
        elementType: 'section',
        formElements: []
    }
    const footerSection = {
        label: nciXmlForm.footerInstruction.text,
        elementType: 'section',
        formElements: []
    }

    for (const q of nciXmlForm.module.question) {
        const cadsrId = q.dataElement.publicID
        let existingCde = await dataElementModel.findOne({
            archived: false,
//            'registrationState.registrationStatus': {$ne: 'Retired'},
            'ids.id': cadsrId
        });
        if (!existingCde) {
            console.info(`${cadsrId} not found.`)
        } else {
            console.info(`${cadsrId} found.`)
            const question = convertCadsrXmlToQuestion(existingCde.toObject(), q)
            section.formElements.push(question)
        }
    }
    const formElements = [
        headerSection, section, footerSection
    ];
    return formElements;
}

function convertCadsrXmlToQuestion(cde, xml) {
    const question: any = {
        cde: {
            tinyId: cde.tinyId,
            permissibleValues: cde.valueDomain.permissibleValues,
            ids: cde.ids,
            derivationRules: cde.derivationRules
        },
        datatype: cde.valueDomain.datatype,
        answers: cde.valueDomain.permissibleValues,
        required: xml.isMandatory.toLowerCase() === 'yes',
        editable: xml.isEditable.toLowerCase() === 'yes',
        multiselect: xml.multiValue.toLowerCase() === 'yes',
    };
    if (cde.valueDomain.datatype === 'Text' && !isEmpty(cde.valueDomain.datatypeText)) {
        question.datatypeText = cde.valueDomain.datatypeText;
    }
    if (cde.valueDomain.datatype === 'Number' && !isEmpty(cde.valueDomain.datatypeNumber)) {
        question.datatypeNumber = cde.valueDomain.datatypeNumber;
    }
    if (cde.valueDomain.datatype === 'Date' && !isEmpty(cde.valueDomain.datatypeDate)) {
        question.datatypeDate = cde.valueDomain.datatypeDate;
    }

    if (cde.version) {
        question.cde.version = cde.version;
    }
    return {
        elementType: 'question',
        label: xml.questionText,
        instructions: {value: xml.instruction.text},
        question
    };
}
