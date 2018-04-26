import { iterateFesSync, score } from 'shared/form/formShared';

export function evaluateSkipLogic(condition, parent, fe, nrs) {
    if (!condition) return true;
    let rule = condition.trim();
    if (rule.indexOf('OR') > -1) {
        return (evaluateSkipLogic(/.+OR/.exec(rule)[0].slice(0, -3), parent, fe, nrs) ||
            evaluateSkipLogic(/OR.+/.exec(rule)[0].substr(3), parent, fe, nrs));
    }
    if (rule.indexOf('AND') > -1) {
        return evaluateSkipLogic(/.+AND/.exec(rule)[0].slice(0, -4), parent, fe, nrs) &&
            evaluateSkipLogic(/AND.+/.exec(rule)[0].substr(4), parent, fe, nrs);
    }

    let operatorArr = />=|<=|=|>|<|!=/.exec(rule);
    if (!operatorArr || operatorArr.length <= 0) {
        nrs.addError('SkipLogic is incorrect. Operator is missing. ' + rule);
        return false;
    }
    let operator = operatorArr[0];

    let ruleArr = rule.split(/>=|<=|=|>|<|!=/);
    if (ruleArr.length !== 2) {
        nrs.addError('SkipLogic is incorrect. Operator requires 2 arguments. ' + rule);
        return false;
    }
    let questionLabel = ruleArr[0].replace(/"/g, '').trim();
    let expectedAnswer = ruleArr[1].replace(/"/g, '').trim();

    let realAnswerObj = getQuestionPriorByLabel(parent, fe, questionLabel);
    if (!realAnswerObj) {
        nrs.addError('SkipLogic is incorrect. Question not found. ' + rule);
        return false;
    }

    let realAnswer = realAnswerObj.question.isScore
        ? score(realAnswerObj, nrs.vm)
        : realAnswerObj.question.answer;
    if (realAnswer === undefined || realAnswer === null ||
        (typeof realAnswer === 'number' && isNaN(realAnswer))) realAnswer = '';

    if (expectedAnswer === '' && operator === '=') {
        if (realAnswerObj.question.datatype === 'Number') {
            if (realAnswer === '' || isNaN(realAnswer)) return true;
        } else {
            if (realAnswer === '' || ('' + realAnswer).trim().length === 0) return true;
        }
    }
    if (!realAnswer && realAnswer !== '') return false;
    switch (realAnswerObj.question.datatype) {
        case 'Date':
            // format HTML5 standard YYYY-MM-DD to American DD/MM/YYYY
            if (realAnswer) {
                let match = /(\d{4})-(\d{2})-(\d{2})/.exec(realAnswer);
                if (match.length === 4) realAnswer = match[2] + '/' + match[3] + '/' + match[1];
            }
            if (operator === '=') return new Date(realAnswer).getTime() === new Date(expectedAnswer).getTime();
            if (operator === '!=') return new Date(realAnswer).getTime() !== new Date(expectedAnswer).getTime();
            if (operator === '<') return new Date(realAnswer) < new Date(expectedAnswer);
            if (operator === '>') return new Date(realAnswer) > new Date(expectedAnswer);
            if (operator === '<=') return new Date(realAnswer) <= new Date(expectedAnswer);
            if (operator === '>=') return new Date(realAnswer) >= new Date(expectedAnswer);
            nrs.addError('SkipLogic is incorrect. Operator ' + operator + ' is incorrect for type date. ' + rule);
            return false;
        case 'Number':
            if (operator === '=') return realAnswer === parseInt(expectedAnswer);
            if (operator === '!=') return realAnswer !== parseInt(expectedAnswer);
            if (operator === '<') return realAnswer < parseInt(expectedAnswer);
            if (operator === '>') return realAnswer > parseInt(expectedAnswer);
            if (operator === '<=') return realAnswer <= parseInt(expectedAnswer);
            if (operator === '>=') return realAnswer >= parseInt(expectedAnswer);
            nrs.addError('SkipLogic is incorrect. Operator ' + operator + ' is incorrect for type number. ' + rule);
            return false;
        case 'Text':
            if (operator === '=') return realAnswer === expectedAnswer;
            if (operator === '!=') return realAnswer !== expectedAnswer;
            nrs.addError('SkipLogic is incorrect. Operator ' + operator + ' is incorrect for type text. ' + rule);
            return false;
        case 'Value List':
            if (operator === '=') {
                return Array.isArray(realAnswer) ? realAnswer.indexOf(expectedAnswer) > -1 : realAnswer === expectedAnswer;
            }
            if (operator === '!=') {
                return Array.isArray(realAnswer) ? realAnswer.length !== 1 || realAnswer[0] !== expectedAnswer
                    : realAnswer !== expectedAnswer;
            }
            nrs.addError('SkipLogic is incorrect. Operator ' + operator + ' is incorrect for value list. ' + rule);
            return false;
        default: // external, text treatment
            if (operator === '=') return realAnswer === expectedAnswer;
            if (operator === '!=') return realAnswer !== expectedAnswer;
            nrs.addError('SkipLogic is incorrect. Operator ' + operator + ' is incorrect for type external. ' + rule);
            return false;
    }
}

export function getLabel(q) {
    if (q.label) return q.label.trim();
    if (q.question && q.question.cde) return q.question.cde.name.trim();
    return ''; // ERROR: question is malformed, validation should catch this
}

export function getQuestions(fes, filter = undefined) {
    let matchedQuestions = [];
    iterateFesSync(fes, undefined, undefined, fe => {
        if (!filter || filter(fe)) matchedQuestions.push(fe);
    });
    return matchedQuestions;
}

export function getQuestionsPrior(parent, fe, filter = undefined) {
    let index = -1;
    if (fe) index = parent.formElements.indexOf(fe);

    return getQuestions(index > -1 ? parent.formElements.slice(0, index) : parent.formElements, filter);
}

export function getQuestionPriorByLabel(parent, fe, label) {
    label = label.trim();
    let matchedQuestions = getQuestionsPrior(parent, fe, fe => getLabel(fe) === label);
    if (matchedQuestions.length <= 0) return null;
    return matchedQuestions[matchedQuestions.length - 1];
}

export function getShowIfQ(fes, fe) {
    if (fe.skipLogic && fe.skipLogic.condition) {
        let strPieces = fe.skipLogic.condition.split('"');
        if (strPieces[0] === '') strPieces.shift();
        if (strPieces[strPieces.length - 1] === '') strPieces.pop();
        return strPieces.reduce((acc, e, i, strPieces) => {
            let matchQ = getQuestionPriorByLabel({formElements: fes}, fe, strPieces[i]);
            if (matchQ) {
                let operator = strPieces[i + 1].trim();
                let compValue = strPieces[i + 2];
                let operatorWithNumber = operator.split(' ');
                if (operatorWithNumber.length > 1) {
                    operator = operatorWithNumber[0];
                    compValue = operatorWithNumber[1];
                }
                acc.push([matchQ, strPieces[i], operator, compValue]);
            }
            return acc;
        }, []);
    }
    return [];
}

export function tokenSanitizer(label) {
    return label.replace(/"/g, "'").trim();
}

export function tokenSplitter(str) {
    let tokens = [];
    tokens.unmatched = '';
    if (!str) return tokens;
    str = str.trim();
    if (!str) return tokens;

    let res = str.match(/^"[^"]+"/);
    if (!res) {
        tokens.unmatched = str;
        return tokens;
    }
    str = str.substring(res[0].length).trim();
    tokens.push(res[0]);

    res = str.match(/^(>=|<=|=|>|<|!=)/);
    if (!res) {
        tokens.unmatched = str;
        return tokens;
    }
    tokens.push(res[0]);
    str = str.substring(res[0].length).trim();

    res = str.match(/(^"?([^"]+)"?)|("")/);
    if (!res) {
        tokens.unmatched = str;
        return tokens;
    }
    tokens.push(res[0]);
    str = str.substr(res[0].length).trim();

    res = str.match(/^((\bAND\b)|(\bOR\b))/);
    if (!res) {
        tokens.unmatched = str;
        return tokens;
    }
    tokens.push(res[0]);
    str = str.substring(res[0].length).trim();

    tokens.unmatched = str;

    if (str.length > 0) {
        let innerTokens = tokenSplitter(str);
        let outerTokens = tokens.concat(innerTokens);
        outerTokens.unmatched = innerTokens.unmatched;
        return outerTokens;
    }
    return tokens;
}
