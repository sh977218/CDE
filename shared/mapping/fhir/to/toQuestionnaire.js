import { ITEM_MAP } from 'shared/item';
import { getQuestionPriorByLabel, tokenSplitter } from 'shared/form/skipLogic';
import {
    containerToItemType, itemTypeToItemDatatype, permissibleValueToCoding, valueToTypedValue
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
        contact: [{ name: 'CDE Repository', telecom: [{system: 'url', value: config.publicUrl}]}],
        copyright: form.copyright && form.copyright.text ? form.copyright.text || form.copyright.authority : undefined,
        date: form.updated ? form.updated.toISOString() : form.created.toISOString(),
        identifier: [newIdentifier(config.publicUrl + '/schema/form', form.tinyId, 'official')],
        item: [],
        name: form.designations[0].designation,
        publisher: 'NIH, National Library of Medicine, Common Data Elements Repository',
        resourceType: 'Questionnaire',
        status: regStatusToPublicationStatus(form.registrationState.registrationStatus),
        subjectType: ['Encounter'], // Required, Other Values: Bundle ResearchStudy ResearchSubject ...
        title: form.designations[0].designation,
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
            repeats: !!fe.repeat || undefined,
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
            fe.question.answers.forEach(a => item.option.push({valueCoding: permissibleValueToCoding(a)}));
        }
        if (fe.skipLogic && fe.skipLogic.condition) {
            let tokens = tokenSplitter(fe.skipLogic.condition);
            if (tokens.length >= 3) {
                item.enableWhen = [];
                for (let i = 0, size = tokens.length; i + 3 <= size; i+=4) {
                    let q = getQuestionPriorByLabel(form, fe, tokens[i].substring(1, tokens[i].length - 1));
                    if (q) {
                        let when = {
                            question: q.feId,
                        };
                        if (['""', ''].indexOf(tokens[i + 2]) > -1) {
                            when.hasAnswer = false;
                        } else {
                            let qType = containerToItemType(q.question);
                            when['answer' + capString(itemTypeToItemDatatype(qType))] = valueToTypedValue(q.question,
                                qType, tokens[i + 2].substring(1, tokens[i + 2].length - 1), tokens[i + 1]);
                        }
                        item.enableWhen.push(when);
                    }
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
