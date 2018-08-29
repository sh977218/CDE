import { getLabel as getLabelShared, iterateFesSync } from 'shared/form/formShared';

export function getLabel(q) {
    return getLabelShared(q).trim();
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

    res = str.match(/(^"[^"]+")|(^[^"]+)|("")/);
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
