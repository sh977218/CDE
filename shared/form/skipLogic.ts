import { range } from 'shared/array';
import { getLabel as getLabelShared, iterateFesSync } from 'shared/form/fe';
import { FormElement, FormElementsContainer, FormQuestion } from 'shared/form/form.model';

type filter = (fe: FormQuestion) => boolean;
export type SkipLogicOperators = '=' | '!=' | '>' | '<' | '>=' | '<=';

export function getLabel(q: FormQuestion): string {
    return getLabelShared(q).trim();
}

export function getQuestions(fes: FormElement[], filter?: filter): FormQuestion[] {
    const matchedQuestions: FormQuestion[] = [];
    iterateFesSync(fes, undefined, undefined, fe => {
        if (!filter || filter(fe)) {
            matchedQuestions.push(fe);
        }
    });
    return matchedQuestions;
}

export function getQuestionsPrior(parent: FormElementsContainer, fe: FormElement, filter?: filter,
                                  topFe?: FormElementsContainer): FormQuestion[] { // search all tree prior
    function questions(parent: FormElementsContainer, index: number) {
        return getQuestions(parent.formElements.slice(0, index > 0 ? index : 0), filter);
    }
    const index = parent.formElements.indexOf(fe);

    if (!topFe || topFe === parent) {
        return questions(parent, index);
    }

    // breadth-first search with "path" traversal top-down
    type PriorElement = {parent: FormElementsContainer<FormElement>, index: number};
    const queue: PriorElement[][] = [range(topFe.formElements.length).map(i => ({parent: topFe, index: i}))];
    let path: PriorElement[] = [];
    while (queue.length) {
        const input: PriorElement[] = queue.shift() || [];
        const self = input[input.length - 1].parent.formElements[input[input.length - 1].index];
        const index = self.formElements.indexOf(parent as FormElement);
        if (index > -1) {
            path = input.concat({parent: self, index});
            break;
        }
        /*jshint loopfunc: true */
        self.formElements.forEach((f: FormElement, i: number) => queue.push(input.concat({parent: self, index: i})));
    }
    path.push({parent, index});
    return path.reduce<FormQuestion[]>((acc, p) => acc.concat(questions(p.parent, p.index)), []);
}

export function getQuestionPriorByLabel(parent: FormElementsContainer, fe: FormElement, label: string,
                                        topFe?: FormElementsContainer): FormQuestion | undefined {
    label = label.trim();
    const matchedQuestions = getQuestionsPrior(parent, fe, fe => getLabel(fe) === label, topFe);
    if (matchedQuestions.length <= 0) {
        return undefined;
    }
    return matchedQuestions[matchedQuestions.length - 1];
}

export class Tokens extends Array {
    unmatched: string = '';
}

export function tokenSplitter(str: string): Tokens {
    const tokens: Tokens = new Tokens();
    if (!str) {
        return tokens;
    }
    str = str.trim();
    if (!str) {
        return tokens;
    }

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
        const innerTokens = tokenSplitter(str);
        const outerTokens = tokens.concat(innerTokens) as Tokens;
        outerTokens.unmatched = innerTokens.unmatched;
        return outerTokens;
    }
    return tokens;
}
