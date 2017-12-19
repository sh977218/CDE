import { ErrorHandler, Injectable } from '@angular/core';
import trim from 'lodash.trim';
import { CdeForm, FormElement, FormElementsContainer, FormQuestion, SkipLogic } from 'core/form.model';
import { FormService } from './form.service';
import { FrontExceptionHandler } from '_commonApp/frontExceptionHandler';

@Injectable()
export class SkipLogicService {
    previousSkipLogicPriorToSelect = '';

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

    static getShowIfQ(parent: FormElementsContainer, fe: FormElement): any[] {
        if (fe.skipLogic && fe.skipLogic.condition) {
            let strPieces = fe.skipLogic.condition.split('"');
            if (strPieces[0] === '') strPieces.shift();
            if (strPieces[strPieces.length - 1] === '') strPieces.pop();
            return strPieces.reduce((acc, e, i, strPieces) => {
                let matchQ = this.getQuestionPriorByLabel(parent, fe, strPieces[i]);
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

    getTypeaheadOptions(currentContent, parent: FormElementsContainer, fe: FormElement): string[] {
        if (!currentContent) currentContent = '';
        if (!fe.skipLogic) fe.skipLogic = new SkipLogic();

        let tokens = SkipLogicService.tokenSplitter(currentContent);
        this.previousSkipLogicPriorToSelect = currentContent.substr(0, currentContent.length - tokens.unmatched.length);

        let options: string[];
        if (tokens.length % 4 === 0) {
            options = SkipLogicService.getQuestionsPrior(parent, fe)
                .filter(q => q.question.datatype !== 'Value List' || q.question.answers && q.question.answers.length > 0)
                .map(q => '"' + SkipLogicService.getLabel(q) + '" ');
        } else if (tokens.length % 4 === 1) {
            options = ['= ', '< ', '> ', '>= ', '<= ', '!= '];
        } else if (tokens.length % 4 === 2) {
            options = SkipLogicService.getTypeaheadOptionsAnswer(parent, fe, tokens[tokens.length - 2])
                .map(a => '"' + a + '" ');
        } else if (tokens.length % 4 === 3) {
            options = ['AND ', 'OR '];
        }

        if (!options) options = [];
        let optionsFiltered = options.filter(o => o.toLowerCase().indexOf(tokens.unmatched.toLowerCase()) > -1);
        if (optionsFiltered.length > 6)
            optionsFiltered = optionsFiltered.slice(optionsFiltered.length - 6, optionsFiltered.length);
        if (optionsFiltered.length > 0)
            options = optionsFiltered;

        return options;
    }

    static getTypeaheadOptionsAnswer(parent: FormElementsContainer, fe: FormElement, questionName: string): string[] {
        let q = this.getQuestionPriorByLabel(parent, fe, questionName.substring(1, questionName.length - 1));
        if (!q)
            return [];

        if (q.question.datatype === 'Value List')
            return q.question.answers.map(a => this.tokenSanitizer(a.permissibleValue));
        if (q.question.datatype === 'Number')
            return ['{{' + q.question.datatype + '}}'];
        if (q.question.datatype === 'Date')
            return ['{{MM/DD/YYYY}}'];
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

        res = str.match(/^"([^"]*)"/);
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

    typeaheadSkipLogic(parent: FormElementsContainer, fe: FormElement, event): boolean {
        let skipLogic = fe.skipLogic;
        skipLogic.validationError = undefined;
        if (event && event.item)
            skipLogic.condition = this.previousSkipLogicPriorToSelect + event.item;
        else
            skipLogic.condition = event;

        return SkipLogicService.validateSkipLogic(parent, fe);
    }

    static validateSkipLogic(parent: FormElementsContainer, fe: FormElement): boolean {
        // skip logic object should exist
        let skipLogic = fe.skipLogic;
        let tokens = SkipLogicService.tokenSplitter(skipLogic.condition);
        if (tokens.unmatched) {
            skipLogic.validationError = 'Unexpected token: ' + tokens.unmatched;
            return false;
        }
        if (tokens.length === 0)
            return true;
        if (tokens.length % 4 !== 3) {
            skipLogic.validationError = 'Unexpected number of tokens in expression ' + tokens.length;
            return false;
        }
        let err = SkipLogicService.validateSkipLogicSingleExpression(parent, fe, tokens.slice(0, 3));
        if (err) {
            skipLogic.validationError = err;
            return false;
        }
        return true;
    }

    static validateSkipLogicSingleExpression(parent: FormElementsContainer, fe: FormElement, tokens): string {
        let filteredQuestion = this.getQuestionPriorByLabel(parent, fe, trim(tokens[0], '"'));
        if (!filteredQuestion)
            return tokens[0] + ' is not a valid question label';

        switch (filteredQuestion.question.datatype) {
            case 'Value List':
                if (tokens[2].length > 0 && filteredQuestion.question.answers.map(a => '"' + SkipLogicService
                        .tokenSanitizer(a.permissibleValue) + '"').indexOf(tokens[2]) < 0)
                    return tokens[2] + ' is not a valid answer for "' + filteredQuestion.label + '"';
                break;
            case 'Number':
                if (isNaN(tokens[2]))
                    return tokens[2] + ' is not a valid number for "' + filteredQuestion.label + '". Replace ' + tokens[2] + ' with a valid number.';
                if (filteredQuestion.question.datatypeNumber) {
                    let answerNumber = parseInt(tokens[2]);
                    let max = filteredQuestion.question.datatypeNumber.maxValue;
                    let min = filteredQuestion.question.datatypeNumber.minValue;
                    if (min !== undefined && answerNumber < min)
                        return tokens[2] + ' is less than a minimal answer for "' + filteredQuestion.label + '"';
                    if (max !== undefined && answerNumber > max)
                        return tokens[2] + ' is bigger than a maximal answer for "' + filteredQuestion.label + '"';
                }
                break;
            case 'Date':
                if (tokens[2].length > 0 && new Date(tokens[2]).toString() === 'Invalid Date')
                    return tokens[2] + ' is not a valid date for "' + filteredQuestion.label + '".';
                break;
        }
        return null;
    }
}
