import { dataElementModel } from 'server/cde/mongo-cde';
import { cloneDeep, isEmpty, unionWith, isEqual } from 'lodash';
import { parseAnswers } from 'ingester/ninds/website/cde/ParseValueDomain';

export async function parseFormElements(nindsForms: any[]) {
    const formElements: any[] = [];

    const nindsQuestionList: any[] = [];
    const nindsCdeIdList: any[] = [];
    nindsForms.forEach(nindsForm => {
        if (!isEmpty(nindsForm.cdes)) {
            const questions: any[] = [];
            nindsForm.cdes.forEach((cde: any) => {
                const _cde = cloneDeep(cde);
                delete _cde.Disease;
                delete _cde.Domain;
                delete _cde['Sub-Domain'];
                delete _cde.SubDisease;
                questions.push(_cde);
            });
            nindsQuestionList.push(questions);
        }
        if (!isEmpty(nindsForm.cdes)) {
            nindsForm.cdes.forEach((nindsCde: any) => {
                if (nindsCde['CDE ID']) {
                    nindsCdeIdList.push(nindsCde['CDE ID']);
                }
            });
        }
    });

    const _nindsQuestionList = unionWith(nindsQuestionList, isEqual);

    if (_nindsQuestionList.length === 0) {
        return formElements;
    }

    formElements.push({
        elementType: 'section',
        instructions: {value: ''},
        label: '',
        formElements: []
    });
    for (const nindsQuestion of _nindsQuestionList[0]) {
        const cdeId = nindsQuestion['CDE ID'];
        const existingCde: any = await dataElementModel.findOne({
            archived: false,
            'ids.id': cdeId,
            'registrationState.registrationStatus': {$ne: 'Retired'}
        });
        if (!existingCde) {
            console.log(cdeId + ' not exists.');
            process.exit(1);
        }
        const question: any = {
            cde: {
                tinyId: existingCde.tinyId,
                name: existingCde.designations[0].designation,
                designations: existingCde.designations,
                version: existingCde.version,
                ids: existingCde.ids
            },
            datatype: existingCde.valueDomain.datatype,
            uom: existingCde.valueDomain.uom
        };
        if (question.datatype === 'Value List') {
            question.answers = parseAnswers(nindsQuestion);
            question.cde.permissibleValues = existingCde.valueDomain.permissibleValues;
            question.multiselect = nindsQuestion.Instructions === 'Multiple Pre-Defined Values Selected';
        } else if (question.datatype === 'Text') {
            question.datatypeText = existingCde.valueDomain.datatypeText;
        } else if (question.datatype === 'Number') {
            question.datatypeNumber = existingCde.valueDomain.datatypeNumber;
        } else if (question.datatype === 'Date') {
            question.datatypeDate = {
                precision: 'Minute'
            };
        } else if (question.datatype === 'File') {
            question.datatypeDate = existingCde.valueDomain.datatypeDate;
        } else {
            console.log('Unknown question.datatype: ' + question.datatype + ' cde id: ' + existingCde.ids[0].id);
            process.exit(1);
        }

        formElements[0].formElements.push({
            elementType: 'question',
            label: nindsQuestion['Question Text'],
            instructions: {value: nindsQuestion.Instructions},
            question,
            formElements: []
        });
    }
    return formElements;
}
