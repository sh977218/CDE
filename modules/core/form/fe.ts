import { iterateFeSync, iterateFeSyncOptions, noopSkipSync } from 'shared/form/fe';
import {
    FormElement, FormElementsContainer, FormInForm, FormQuestion, FormSection, Question, QuestionCde
} from 'shared/form/form.model';

export function areDerivationRulesSatisfied(elt: FormElementsContainer): string[] {
    let missingCdeTinyIds: string[] = [];
    let allCdes: {[tinyId: string]: Question} = {};
    let allQuestions: FormQuestion[] = [];
    iterateFeSync(elt, undefined, undefined, (q) => {
        if (q.question.datatype === 'Number') {
            q.question.answer = q.question.defaultAnswer ? Number.parseFloat(q.question.defaultAnswer) : 0;
        } else {
            q.question.answer = q.question.defaultAnswer;
        }
        allCdes[q.question.cde.tinyId] = q.question;
        allQuestions.push(q);
    });
    allQuestions.forEach(quest => {
        if (quest.question.cde.derivationRules) {
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
        }
    });
    return missingCdeTinyIds;
}

// excludes subForms
export function findQuestionByTinyId(tinyId: string, elt: FormElementsContainer): FormQuestion | undefined {
    let question: FormQuestion | undefined;
    iterateFeSyncOptions(elt, noopSkipSync, undefined, q => q.question.cde.tinyId === tinyId && (question = q));
    return question;
}

export function getFormQuestions(form: FormElementsContainer): FormQuestion[] {
    let questions: FormQuestion[] = [];
    iterateFeSync(form, undefined, undefined, q => questions.push(q));
    return questions;
}

export function getFormScoreQuestions(form: FormElementsContainer): FormQuestion[] {
    let questions: FormQuestion[] = [];
    iterateFeSync(form, undefined, undefined, q => q.question.isScore && questions.push(q));
    return questions;
}

export function getFormSkipLogicQuestions(form: FormElementsContainer): FormQuestion[] {
    let questions: FormQuestion[] = [];
    iterateFeSync(form, undefined, undefined, q => q.skipLogic && q.skipLogic.condition.length > 0 && questions.push(q));
    return questions;
}

export function getFormQuestionsAsQuestion(form: FormElementsContainer): Question[] {
    return getFormQuestions(form).map(q => q.question);
}

export function getFormQuestionsAsQuestionCde(form: FormElementsContainer): QuestionCde[] {
    return getFormQuestions(form).map(q => q.question.cde);
}

export function isInForm(fe: FormElement): fe is FormInForm {
    return fe && fe.elementType === 'form';
}

export function isQuestion(fe: FormElement): fe is FormQuestion {
    return fe && fe.elementType === 'question';
}

export function isSection(fe: FormElement): fe is FormSection {
    return fe && fe.elementType === 'section';
}

export function questionAnswered(q: FormQuestion): boolean {
    return typeof(q.question.answer) !== 'undefined'
        && !(Array.isArray(q.question.answer) && q.question.answer.length === 0);
}

export function repeatFe(fe: FormElement): '' | '=' | 'F' | 'N' {
    if (!fe.repeat) return '';
    if (fe.repeat[0] === 'F') return 'F';
    if (fe.repeat.startsWith('="') && fe.repeat.length >= 3 && fe.repeat.endsWith('"')) return '=';
    return 'N';
}

export function repeatFeLabel(fe: FormElement): string {
    switch (repeatFe(fe)) {
        case '=':
            return 'over Question Answer ' + fe.repeat!.substr(1);
        case 'F':
            return 'over First Question';
        case 'N':
            return repeatFeNumber(fe) + ' times';
        default:
            return '';
    }
}

export function repeatFeNumber(fe: FormElement): number {
    return fe.repeat ? parseInt(fe.repeat) : 0;
}

export function repeatFeQuestion(fe: FormElement): string {
    return fe.repeat && fe.repeat[0] === '=' ? fe.repeat.substring(2, fe.repeat.length - 1) : '';
}