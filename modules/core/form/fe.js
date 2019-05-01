import { iterateFeSync, iterateFeSyncOptions, noopSkipSync } from 'shared/form/fe';

export function areDerivationRulesSatisfied(elt) {
    let missingCdeTinyIds = [];
    let allCdes = {};
    let allQuestions = [];
    iterateFeSync(elt, undefined, undefined, (q) => {
        if (q.question.datatype === 'Number') {
            q.question.answer = Number.parseFloat(q.question.defaultAnswer);
        } else {
            q.question.answer = q.question.defaultAnswer;
        }
        allCdes[q.question.cde.tinyId] = q.question;
        allQuestions.push(q);
    });
    allQuestions.forEach(quest => {
        if (quest.question.cde.derivationRules)
            quest.question.cde.derivationRules.forEach(derRule => {
                delete quest.incompleteRule;
                if (derRule.ruleType === 'score') {
                    quest.question.isScore = true;
                    quest.question.scoreFormula = derRule.formula;
                }
                derRule.inputs.forEach(input => {
                    if (allCdes[input]) {
                        allCdes[input].partOf = 'score';
                    } else {
                        missingCdeTinyIds.push(input);
                        quest.incompleteRule = true;
                    }
                });
            });
    });
    return missingCdeTinyIds;
}

// excludes subForms
export function findQuestionByTinyId(tinyId, elt) {
    let question;
    iterateFeSyncOptions(elt, noopSkipSync, undefined, q => q.question.cde.tinyId === tinyId && (question = q));
    return question;
}

export function getFormQuestions(form) {
    let questions = [];
    iterateFeSync(form, undefined, undefined, q => questions.push(q));
    return questions;
}

export function getFormScoreQuestions(form) {
    let questions = [];
    iterateFeSync(form, undefined, undefined, q => q.question.isScore && questions.push(q));
    return questions;
}

export function getFormSkipLogicQuestions(form) {
    let questions = [];
    iterateFeSync(form, undefined, undefined, q => q.skipLogic.condition.length > 0 && questions.push(q));
    return questions;
}

export function getFormQuestionsAsQuestion(form) {
    return getFormQuestions(form).map(q => q.question);
}

export function getFormQuestionsAsQuestionCde(form) {
    return getFormQuestions(form).map(q => q.question.cde);
}

export function isInForm(fe) {
    return fe && fe.elementType === 'form';
}

export function isQuestion(fe) {
    return fe && fe.elementType === 'question';
}

export function isSection(fe) {
    return fe && fe.elementType === 'section';
}

export function questionAnswered(q) {
    return typeof(q.question.answer) !== 'undefined'
        && !(Array.isArray(q.question.answer) && q.question.answer.length === 0);
}

export function repeatFe(fe) {
    if (!fe.repeat) return '';
    if (fe.repeat[0] === 'F') return 'F';
    if (fe.repeat.startsWith('="') && fe.repeat.length >= 3 && fe.repeat.endsWith('"')) return '=';
    return 'N';
}

export function repeatFeLabel(fe) {
    switch (repeatFe(fe)) {
        case '=':
            return 'over Question Answer ' + fe.repeat.substr(1);
        case 'F':
            return 'over First Question';
        case 'N':
            return repeatFeNumber(fe) + ' times';
        default:
            return '';
    }
}

export function repeatFeNumber(fe) {
    return parseInt(fe.repeat);
}

export function repeatFeQuestion(fe) {
    return fe.repeat && fe.repeat[0] === '=' ? fe.repeat.substring(2, fe.repeat.length - 1) : '';
}