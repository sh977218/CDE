import { ITEM_MAP } from 'shared/item';
import { pvGetLabel } from 'shared/de/deShared';
import { getQuestionPriorByLabel, tokenSplitter } from 'shared/form/skipLogic';
import {
    containerToItemType, itemTypeToItemDatatype, valueToTypedValue
} from 'shared/mapping/fhir/to/datatypeToItemType';
import { regStatusToPublicationStatus, sourceToUriMap} from 'shared/mapping/fhir/to/enumToValueSet';
import { newIdentifier} from 'shared/mapping/fhir/to/toFhir';
import { capString } from 'shared/system/util';

/*
 * Call as formToQuestionnaire(form, options, window)
 *      or formToQuestionnaire(form, options, require(./server/system/parseConfig))
 */
export function formToQuestionnaire(form, options, config) {
    let Q = {
        code: form.fhir && form.fhir.code ? form.fhir.code : undefined, // TODO: to be implemented by form tagging
        contact: { name: 'CDE Repository', telecom: {system: 'url', value: config.publicUrl}},
        copyright: form.copyright && form.copyright.text ? form.copyright.text || form.copyright.authority : undefined,
        date: form.updated || form.created,
        identifier: [newIdentifier(config.publicUrl + '/schema/form', form.tinyId, 'official')],
        item: [],
        name: form.naming[0].designation,
        publisher: 'NIH, National Library of Medicine, Common Data Elements Repository',
        status: regStatusToPublicationStatus(form.registrationState.registrationStatus),
        subjectType: ['Encounter'], // Required, Other Values: Bundle ResearchStudy ResearchSubject ...
        title: form.naming[0].designation,
        url: config.publicUrl + ITEM_MAP.form.view + form.tinyId,
        version: form.version || undefined,
    };
    if (Array.isArray(form.ids)) {
        form.ids.forEach(id => Q.identifier.push(newIdentifier(sourceToUriMap(id.source), id.id, 'usual')));
    }
    if (Array.isArray(form.formElements)) {
        form.formElements.forEach(fe => Q.item.push(feToQuestionnaireItem(form, fe, options, config)));
    }
    return Q;
}

export function feToQuestionnaireItem(form, fe, options, config) {
    let item;
    let children = [];
    if (fe.elementType === 'question') {
        item = {
            definition: config.publicUrl + ITEM_MAP.cde.view + fe.question.cde.tinyId,
            linkId: fe.feId,
            readOnly: !fe.question.editable || undefined,
            required: fe.question.required || undefined,
            repeats: !!fe.repeat,
            text: fe.label || undefined,
            type: containerToItemType(fe.question),
        };
        if ((item.type === 'string' || item.type === 'text') && fe.question.dataTypeText
            && fe.question.dataTypeText.maxLength) {
            item.maxLength = fe.question.datatypeText.maxLength;
        }
        if (fe.question.defaultAnswer) {
            item['initial' + capString(itemTypeToItemDatatype(item.type))] = valueToTypedValue(fe.question, item.type,
                fe.question.defaultAnswer);
        }
        if (Array.isArray(fe.question.answers) && fe.question.answers.length) {
            item.option = [];
            fe.question.answers.forEach(a => item.option.push({valueString: pvGetLabel(a)}));
        }
        if ((item.type === 'choice' || item.type === 'open-choice') && fe.skipLogic && fe.skipLogic.condition) {
            let tokens = tokenSplitter(fe.skipLogic.condition);
            if (tokens.length >= 3) {
                let q = getQuestionPriorByLabel(form, fe, tokens[0].substring(1, tokens[0].length - 1));
                if (q) {
                    item.enableWhen = {
                        question: q.feId,
                    };
                    let qType = containerToItemType(q.question);
                    item.enableWhen['answer' + capString(itemTypeToItemDatatype(qType))] = valueToTypedValue(q.question,
                        qType, tokens[2].substring(1, tokens[2].length - 1), tokens[1]);
                }
            }
        }
    } else {
        item = {
            linkId: fe.feId,
            text: fe.label || undefined,
            type: 'group',
        };
    }
    if (Array.isArray(fe.formElements)) {
        fe.formElements.forEach(f => children.push(feToQuestionnaireItem(form, f, options, config)));
    }
    if (fe.question && Array.isArray(fe.question.answers)) {
        fe.question.answers.forEach(pv => {
            if (Array.isArray(pv.formElements)) {
                pv.formElements.forEach(f => children.push(feToQuestionnaireItem(form, f, options, config)));
            }
        });
    }
    if (children.length) item.item = children;
    return item;
}
