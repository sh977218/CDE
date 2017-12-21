import { ErrorHandler, Injectable } from '@angular/core';
import { FormElement, FormElementsContainer, FormQuestion, SkipLogic } from 'core/form.model';
import { FormService } from './form.service';

@Injectable()
export class SkipLogicService {
    constructor(private errorHandler: ErrorHandler) {}

    static evaluateSkipLogic(condition: string, parent: FormElementsContainer, fe: FormElement, nrs) {
        if (!condition)
            return true;
        let rule = condition.trim();
        if (rule.indexOf('AND') > -1)
            return this.evaluateSkipLogic(/.+AND/.exec(rule)[0].slice(0, -4), parent, fe, nrs) &&
                this.evaluateSkipLogic(/AND.+/.exec(rule)[0].substr(4), parent, fe, nrs);
        if (rule.indexOf('OR') > -1)
            return (this.evaluateSkipLogic(/.+OR/.exec(rule)[0].slice(0, -3), parent, fe, nrs) ||
                this.evaluateSkipLogic(/OR.+/.exec(rule)[0].substr(3), parent, fe, nrs));

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

        let realAnswerObj = this.getQuestionPriorByLabel(parent, fe, questionLabel);
        if (!realAnswerObj) {
            nrs.addError('SkipLogic is incorrect. Question not found. ' + rule);
            return false;
        }

        let realAnswer = realAnswerObj.question.isScore ? FormService.score(realAnswerObj, nrs.getElt()) : realAnswerObj.question.answer;
        if (realAnswer === undefined || realAnswer === null ||
            (typeof realAnswer === 'number' && isNaN(realAnswer))) realAnswer = '';

        if (expectedAnswer === '' && operator === '=') {
            if (realAnswerObj.question.datatype === 'Number') {
                if (realAnswer === '' || isNaN(realAnswer))
                    return true;
            } else {
                if (realAnswer === '' || ('' + realAnswer).trim().length === 0)
                    return true;
            }
        }
        if (!realAnswer && realAnswer !== '')
            return false;
        switch (realAnswerObj.question.datatype) {
            case 'Date':
                // format HTML5 standard YYYY-MM-DD to American DD/MM/YYYY
                if (realAnswer) {
                    let match = /(\d{4})-(\d{2})-(\d{2})/.exec(realAnswer);
                    if (match.length === 4)
                        realAnswer = match[2] + '/' + match[3] + '/' + match[1];
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
                    if (Array.isArray(realAnswer))
                        return realAnswer.indexOf(expectedAnswer) > -1;
                    else
                        return realAnswer === expectedAnswer;
                }
                if (operator === '!=') {
                    if (Array.isArray(realAnswer))
                        return realAnswer.length !== 1 || realAnswer[0] !== expectedAnswer;
                    else
                        return realAnswer !== expectedAnswer;
                }
                nrs.addError('SkipLogic is incorrect. Operator ' + operator + ' is incorrect for value list. ' + rule);
                return false;
            default:
                if (operator === '=') return realAnswer === expectedAnswer;
                if (operator === '!=') return realAnswer !== expectedAnswer;
                nrs.addError('SkipLogic is incorrect. Operator ' + operator + ' is incorrect for type external. ' + rule);
                return false;
        }
    }

    evalSkipLogic(parent, fe, nrs) {
        try {
            return SkipLogicService.evaluateSkipLogic(fe.skipLogic ? fe.skipLogic.condition : null, parent, fe, nrs);
        } catch (error) {
            this.errorHandler.handleError({
                name: 'Skip Logic Evaluation Error',
                message: error.message,
                stack: error.stack
            });
            return true;
        }
    }

    evalSkipLogicAndClear(parent, fe, nrs) {
        let skipLogicResult = this.evalSkipLogic(parent, fe, nrs);
        if (!skipLogicResult && fe.question)
            fe.question.answer = undefined;
        return skipLogicResult;
    }

    static getLabel(q) {
        if (q.label)
            return q.label.trim();
        if (q.question && q.question.cde)
            return q.question.cde.name.trim();
        return null; // ERROR: question is malformed, validation should catch this
    }

    static getQuestions(fes: FormElement[], filter = undefined): FormQuestion[] {
        let matchedQuestions = [];
        FormService.iterateFesSync(fes, undefined, undefined, fe => {
            if (!filter || filter(fe))
               matchedQuestions.push(fe);
        });
        return matchedQuestions;
    }

    static getQuestionsPrior(parent: FormElementsContainer, fe: FormElement, filter = undefined): FormQuestion[] {
        let index = -1;
        if (fe)
            index = parent.formElements.indexOf(fe);

        return this.getQuestions(index > -1 ? parent.formElements.slice(0, index) : parent.formElements, filter);
    }

    static getQuestionPriorByLabel(parent: FormElementsContainer, fe: FormElement, label: string): FormQuestion {
        label = label.trim();
        let matchedQuestions = this.getQuestionsPrior(parent, fe, fe => this.getLabel(fe) === label);
        if (matchedQuestions.length <= 0)
            return null;
        return matchedQuestions[0] as FormQuestion;
    }

    static getShowIfQ(fes: FormElement[], fe: FormElement): any[] {
        if (fe.skipLogic && fe.skipLogic.condition) {
            let strPieces = fe.skipLogic.condition.split('"');
            if (strPieces[0] === '') strPieces.shift();
            if (strPieces[strPieces.length - 1] === '') strPieces.pop();
            return strPieces.reduce((acc, e, i, strPieces) => {
                let matchQ = this.getQuestionPriorByLabel({formElements: fes}, fe, strPieces[i]);
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

    static tokenSanitizer(label: string): string {
        return label.replace(/"/g, "'").trim();
    }

    static tokenSplitter(str: string) {
        let tokens: any = [];
        tokens.unmatched = '';
        if (!str)
            return tokens;
        str = str.trim();
        if (!str)
            return tokens;

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

        res = str.match(/^"?([^"]+)"?/);
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
            let innerTokens = this.tokenSplitter(str);
            let outerTokens = tokens.concat(innerTokens);
            outerTokens.unmatched = innerTokens.unmatched;
            return outerTokens;
        } else {
            return tokens;
        }
    }
}
