import { getLabel as getLabelShared, iterateFesSync } from 'shared/form/fe';
import { range } from 'shared/system/util';

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

export function getQuestionsPrior(parent, fe, filter = undefined, topFe = undefined) {
    function questions(parent, index) {
        return getQuestions(parent.formElements.slice(0, index > 0 ? index : 0), filter);
    }
    const index = parent.formElements.indexOf(fe);

    if (!topFe || topFe === parent) {
        return questions(parent, index);
    }

    // breadth-first search with "path" traversal top-down
    const queue = [range(topFe.formElements.length).map(i => ({parent: topFe, index: i}))];
    let path = [];
    while (queue.length) {
        const input = queue.shift();
        const self = input[input.length - 1].parent.formElements[input[input.length - 1].index];
        const index = self.formElements.indexOf(parent);
        if (index > -1) {
            path = input.concat({parent: self, index: index});
            break;
        }
        /*jshint loopfunc: true */
        self.formElements.forEach((f, i) => queue.push(input.concat({parent: self, index: i})));
    }
    path.push({parent, index});
    return path.reduce((acc, p) => acc.concat(questions(p.parent, p.index)), []);
}

export function getQuestionPriorByLabel(parent, fe, label, topFe = undefined) {
    label = label.trim();
    let matchedQuestions = getQuestionsPrior(parent, fe, fe => getLabel(fe) === label, topFe);
    if (matchedQuestions.length <= 0) return null;
    return matchedQuestions[matchedQuestions.length - 1];
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

    res = str.match(/^((\bAND\b)|(\bOR\b))/i);
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
