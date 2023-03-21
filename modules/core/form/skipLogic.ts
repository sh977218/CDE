import { getLabel, getQuestionPriorByLabel, getQuestions } from 'shared/form/skipLogic';
import { FormElement, FormElementsContainer, FormQuestion } from 'shared/form/form.model';
import { Cb1 } from 'shared/models.model';

export const SKIP_LOGIC_OPERATORS_ARRAY: string[] = ['=', '!=', '>', '<', '>=', '<='];

export function evaluateSkipLogic(
    condition: string | undefined,
    parent: FormElementsContainer,
    fe: FormElement,
    addError: Cb1<string>
): boolean {
    if (!condition) {
        return true;
    }
    const rule = condition.trim() || '';
    if (rule.indexOf('OR') > -1) {
        return (
            evaluateSkipLogic(((/.+OR/.exec(rule) || [])[0] || '').slice(0, -3), parent, fe, addError) ||
            evaluateSkipLogic(((/OR.+/.exec(rule) || [])[0] || '').substr(3), parent, fe, addError)
        );
    }
    if (rule.indexOf('AND') > -1) {
        return (
            evaluateSkipLogic(((/.+AND/.exec(rule) || [])[0] || '').slice(0, -4), parent, fe, addError) &&
            evaluateSkipLogic(((/AND.+/.exec(rule) || [])[0] || '').substr(4), parent, fe, addError)
        );
    }

    const operatorArr = />=|<=|=|>|<|!=/.exec(rule);
    if (!operatorArr || operatorArr.length <= 0) {
        addError('SkipLogic is incorrect. Operator is missing. ' + rule);
        return false;
    }
    const operator = operatorArr[0];

    const ruleArr = rule.split(/>=|<=|=|>|<|!=/);
    if (ruleArr.length !== 2) {
        addError('SkipLogic is incorrect. Operator requires 2 arguments. ' + rule);
        return false;
    }
    const questionLabel = ruleArr[0].replace(/"/g, '').trim();
    const expectedAnswer = ruleArr[1].replace(/"/g, '').trim();

    const realAnswerObjOptional = getQuestionPriorByLabel(parent, fe, questionLabel);
    if (!realAnswerObjOptional) {
        addError('SkipLogic is incorrect. Question not found. ' + rule);
        return false;
    }
    const realAnswerObj = realAnswerObjOptional;

    return evalOperator(realAnswerObj.question.answer, expectedAnswer);

    function evalOperator(realAnswer: any, expectedAnswer: any) {
        if (realAnswer === undefined || realAnswer === null || (typeof realAnswer === 'number' && isNaN(realAnswer))) {
            realAnswer = '';
        }

        if (expectedAnswer === '' && operator === '=') {
            if (realAnswerObj.question.datatype === 'Number') {
                if (realAnswer === '' || isNaN(realAnswer)) {
                    return true;
                }
            } else {
                if (realAnswer === '' || ('' + realAnswer).trim().length === 0) {
                    return true;
                }
            }
        }
        if (typeof realAnswer === 'undefined') {
            return false;
        }
        switch (realAnswerObj.question.datatype) {
            case 'Date':
                // format HTML5 standard YYYY-MM-DD to American DD/MM/YYYY
                if (realAnswer) {
                    const match = /(\d{4})-(\d{2})-(\d{2})/.exec(realAnswer);
                    if (match && match.length === 4) {
                        realAnswer = match[2] + '/' + match[3] + '/' + match[1];
                    }
                }
                if (operator === '=') {
                    return new Date(realAnswer).getTime() === new Date(expectedAnswer).getTime();
                }
                if (operator === '!=') {
                    return new Date(realAnswer).getTime() !== new Date(expectedAnswer).getTime();
                }
                if (operator === '<') {
                    return new Date(realAnswer) < new Date(expectedAnswer);
                }
                if (operator === '>') {
                    return new Date(realAnswer) > new Date(expectedAnswer);
                }
                if (operator === '<=') {
                    return new Date(realAnswer) <= new Date(expectedAnswer);
                }
                if (operator === '>=') {
                    return new Date(realAnswer) >= new Date(expectedAnswer);
                }
                addError('SkipLogic is incorrect. Operator ' + operator + ' is incorrect for type date. ' + rule);
                return false;
            case 'Number':
                const expectedAnswerInt = parseInt(expectedAnswer, 10);
                if (operator === '=') {
                    return realAnswer === expectedAnswerInt;
                }
                if (operator === '!=') {
                    return realAnswer !== expectedAnswerInt;
                }
                if (operator === '<') {
                    return realAnswer < expectedAnswerInt;
                }
                if (operator === '>') {
                    return realAnswer > expectedAnswerInt;
                }
                if (operator === '<=') {
                    return realAnswer <= expectedAnswerInt;
                }
                if (operator === '>=') {
                    return realAnswer >= expectedAnswerInt;
                }
                addError('SkipLogic is incorrect. Operator ' + operator + ' is incorrect for type number. ' + rule);
                return false;
            case 'Text':
                if (operator === '=') {
                    return realAnswer === expectedAnswer;
                }
                if (operator === '!=') {
                    return realAnswer !== expectedAnswer;
                }
                addError('SkipLogic is incorrect. Operator ' + operator + ' is incorrect for type text. ' + rule);
                return false;
            case 'Value List':
                if (operator === '=') {
                    return Array.isArray(realAnswer)
                        ? realAnswer.indexOf(expectedAnswer) > -1
                        : realAnswer === expectedAnswer;
                }
                if (operator === '!=') {
                    return Array.isArray(realAnswer)
                        ? realAnswer.length !== 1 || realAnswer[0] !== expectedAnswer
                        : realAnswer !== expectedAnswer;
                }
                addError('SkipLogic is incorrect. Operator ' + operator + ' is incorrect for value list. ' + rule);
                return false;
            default: // external, text treatment
                if (operator === '=') {
                    return realAnswer === expectedAnswer;
                }
                if (operator === '!=') {
                    return realAnswer !== expectedAnswer;
                }
                addError('SkipLogic is incorrect. Operator ' + operator + ' is incorrect for type external. ' + rule);
                return false;
        }
    }
}

export function getQuestionByLabel(fes: FormElement[], label: string): FormQuestion | undefined {
    label = label.trim();
    const matchedQuestions = getQuestions(fes, fe => getLabel(fe) === label);
    if (matchedQuestions.length <= 0) {
        return undefined;
    }
    return matchedQuestions[matchedQuestions.length - 1];
}

export function getShowIfQ(fes: FormElement[], fe: FormElement): any[] {
    if (fe.skipLogic && fe.skipLogic.condition) {
        const strPieces = fe.skipLogic.condition.split('"');
        if (strPieces[0] === '') {
            strPieces.shift();
        }
        if (strPieces[strPieces.length - 1] === '') {
            strPieces.pop();
        }
        return strPieces.reduce((acc: any, e, i, strPieces) => {
            const matchQ = getQuestionByLabel(fes, strPieces[i]);
            if (matchQ && strPieces[i + 1]) {
                let operator = strPieces[i + 1].trim();
                let compValue = strPieces[i + 2];
                const operatorWithNumber = operator.split(' ');
                if (operatorWithNumber.length > 1) {
                    operator = operatorWithNumber[0];
                    compValue = operatorWithNumber[1];
                }
                if (compValue !== undefined && SKIP_LOGIC_OPERATORS_ARRAY.includes(operator)) {
                    acc.push([matchQ, strPieces[i], operator, compValue]);
                }
            }
            return acc;
        }, []);
    }
    return [];
}

export function tokenSanitizer(label: string): string {
    return label.replace(/"/g, "'").trim();
}
