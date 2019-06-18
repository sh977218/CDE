import { getLabel, getQuestionPriorByLabel, getQuestions, } from 'shared/form/skipLogic';

export const SkipLogicOperatorsArray = ['=', '!=', '>', '<', '>=', '<='];

export function evaluateSkipLogic(condition, parent, fe, addError) {
    if (!condition) return true;
    let rule = condition.trim();
    if (rule.indexOf('OR') > -1) {
        return evaluateSkipLogic(/.+OR/.exec(rule)[0].slice(0, -3), parent, fe, addError)
            || evaluateSkipLogic(/OR.+/.exec(rule)[0].substr(3), parent, fe, addError);
    }
    if (rule.indexOf('AND') > -1) {
        return evaluateSkipLogic(/.+AND/.exec(rule)[0].slice(0, -4), parent, fe, addError)
            && evaluateSkipLogic(/AND.+/.exec(rule)[0].substr(4), parent, fe, addError);
    }

    let operatorArr = />=|<=|=|>|<|!=/.exec(rule);
    if (!operatorArr || operatorArr.length <= 0) {
        addError('SkipLogic is incorrect. Operator is missing. ' + rule);
        return false;
    }
    let operator = operatorArr[0];

    let ruleArr = rule.split(/>=|<=|=|>|<|!=/);
    if (ruleArr.length !== 2) {
        addError('SkipLogic is incorrect. Operator requires 2 arguments. ' + rule);
        return false;
    }
    let questionLabel = ruleArr[0].replace(/"/g, '').trim();
    let expectedAnswer = ruleArr[1].replace(/"/g, '').trim();

    let realAnswerObj = getQuestionPriorByLabel(parent, fe, questionLabel);
    if (!realAnswerObj) {
        addError('SkipLogic is incorrect. Question not found. ' + rule);
        return false;
    }

    return evalOperator(realAnswerObj.question.answer, expectedAnswer);

    function evalOperator(realAnswer, expectedAnswer) {
        if (realAnswer === undefined || realAnswer === null ||
            (typeof realAnswer === 'number' && isNaN(realAnswer))) realAnswer = '';

        if (expectedAnswer === '' && operator === '=') {
            if (realAnswerObj.question.datatype === 'Number') {
                if (realAnswer === '' || isNaN(realAnswer)) return true;
            } else {
                if (realAnswer === '' || ('' + realAnswer).trim().length === 0) return true;
            }
        }
        if (typeof (realAnswer) === 'undefined') return false;
        switch (realAnswerObj.question.datatype) {
            case 'Date':
                // format HTML5 standard YYYY-MM-DD to American DD/MM/YYYY
                if (realAnswer) {
                    let match = /(\d{4})-(\d{2})-(\d{2})/.exec(realAnswer);
                    if (match && match.length === 4) realAnswer = match[2] + '/' + match[3] + '/' + match[1];
                }
                if (operator === '=') return new Date(realAnswer).getTime() === new Date(expectedAnswer).getTime();
                if (operator === '!=') return new Date(realAnswer).getTime() !== new Date(expectedAnswer).getTime();
                if (operator === '<') return new Date(realAnswer) < new Date(expectedAnswer);
                if (operator === '>') return new Date(realAnswer) > new Date(expectedAnswer);
                if (operator === '<=') return new Date(realAnswer) <= new Date(expectedAnswer);
                if (operator === '>=') return new Date(realAnswer) >= new Date(expectedAnswer);
                addError('SkipLogic is incorrect. Operator ' + operator + ' is incorrect for type date. ' + rule);
                return false;
            case 'Number':
                if (operator === '=') return realAnswer === parseInt(expectedAnswer);
                if (operator === '!=') return realAnswer !== parseInt(expectedAnswer);
                if (operator === '<') return realAnswer < parseInt(expectedAnswer);
                if (operator === '>') return realAnswer > parseInt(expectedAnswer);
                if (operator === '<=') return realAnswer <= parseInt(expectedAnswer);
                if (operator === '>=') return realAnswer >= parseInt(expectedAnswer);
                addError('SkipLogic is incorrect. Operator ' + operator + ' is incorrect for type number. ' + rule);
                return false;
            case 'Text':
                if (operator === '=') return realAnswer === expectedAnswer;
                if (operator === '!=') return realAnswer !== expectedAnswer;
                addError('SkipLogic is incorrect. Operator ' + operator + ' is incorrect for type text. ' + rule);
                return false;
            case 'Value List':
                if (operator === '=') {
                    return Array.isArray(realAnswer) ? realAnswer.indexOf(expectedAnswer) > -1 : realAnswer === expectedAnswer;
                }
                if (operator === '!=') {
                    return Array.isArray(realAnswer) ? realAnswer.length !== 1 || realAnswer[0] !== expectedAnswer
                        : realAnswer !== expectedAnswer;
                }
                addError('SkipLogic is incorrect. Operator ' + operator + ' is incorrect for value list. ' + rule);
                return false;
            default: // external, text treatment
                if (operator === '=') return realAnswer === expectedAnswer;
                if (operator === '!=') return realAnswer !== expectedAnswer;
                addError('SkipLogic is incorrect. Operator ' + operator + ' is incorrect for type external. ' + rule);
                return false;
        }
    }
}

export function getQuestionByLabel(fes, label) {
    label = label.trim();
    let matchedQuestions = getQuestions(fes, fe => getLabel(fe) === label);
    if (matchedQuestions.length <= 0) return null;
    return matchedQuestions[matchedQuestions.length - 1];
}

export function getShowIfQ(fes, fe) {
    if (fe.skipLogic && fe.skipLogic.condition) {
        let strPieces = fe.skipLogic.condition.split('"');
        if (strPieces[0] === '') strPieces.shift();
        if (strPieces[strPieces.length - 1] === '') strPieces.pop();
        return strPieces.reduce((acc, e, i, strPieces) => {
            let matchQ = getQuestionByLabel(fes, strPieces[i]);
            if (matchQ && strPieces[i + 1]) {
                let operator = strPieces[i + 1].trim();
                let compValue = strPieces[i + 2];
                let operatorWithNumber = operator.split(' ');
                if (operatorWithNumber.length > 1) {
                    operator = operatorWithNumber[0];
                    compValue = operatorWithNumber[1];
                }
                if (compValue !== undefined && SkipLogicOperatorsArray.includes(operator)) {
                    acc.push([matchQ, strPieces[i], operator, compValue]);
                }
            }
            return acc;
        }, []);
    }
    return [];
}

export function tokenSanitizer(label) {
    return label.replace(/"/g, '\'').trim();
}