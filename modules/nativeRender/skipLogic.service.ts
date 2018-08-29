import { ErrorHandler, Injectable } from '@angular/core';

import { getQuestionPriorByLabel } from 'shared/form/skipLogic';
import { findQuestionByTinyId } from 'shared/form/formShared';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class SkipLogicService {
    constructor(private errorHandler: ErrorHandler,
                private http: HttpClient) {
    }

    evalSkipLogic(parent, fe, nrs) {
        try {
            return this.evaluateSkipLogic(fe.skipLogic ? fe.skipLogic.condition : null, parent, fe, nrs);
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
        if (!skipLogicResult && fe.question) fe.question.answer = undefined;
        return skipLogicResult;
    }

    a: number;
    b: number;

    calculateScore(question, elt, cb) {
        if (!question.question.isScore) {
            return;
        }
        let score;
        let error: string = '';
        question.question.cde.derivationRules.forEach(async derRule => {
            if (derRule.ruleType === 'score') {

                if (derRule.formula === 'bmi') {
                    let aQuestion = findQuestionByTinyId(derRule.inputs[0], elt);
                    if (!aQuestion.question.answerUom) {
                        return error = 'Incomplete answers (Weight UOM has to be kg)';
                    }
                    let aResult;
                    let a = parseFloat(aQuestion.question.answer);
                    if (this.a !== a) {
                        aResult = await this.http.get('/ucumConvert?value=' + a + '&from=' + aQuestion.question.answerUom.code + '&to=kg').toPromise();
                        this.a = aResult;
                    } else aResult = this.a;
                    let bQuestion = findQuestionByTinyId(derRule.inputs[1], elt);
                    if (!bQuestion.question.answerUom || bQuestion.question.answerUom.code !== 'm') {
                        return error = 'Incomplete answers (Height UOM has to be m)';
                    }
                    let b = <number>  parseFloat(bQuestion.question.answer);
                    let bResult;
                    if (this.b !== b) {
                        bResult = await this.http.get('/ucumConvert?value=' + b + '&from=' + bQuestion.question.answerUom.code + '&to=m').toPromise();
                        this.b = bResult;
                    } else bResult = this.b;
                    if (aResult && bResult) {
                        score = aResult / (bResult * bResult);
                        cb(score);
                    }
                    else error = 'Incomplete answers';
                }
                if (derRule.formula === 'sumAll' || derRule.formula === 'mean') {
                    console.log('a:');
                    derRule.inputs.forEach(cdeTinyId => {
                        let q = findQuestionByTinyId(cdeTinyId, elt);
                        if (isNaN(score)) {
                            cb(score);
                            return;
                        }
                        if (q) {
                            let answer = q.question.answer;
                            if (typeof(answer) === "undefined" || answer === null) {
                                error = 'Incomplete answers';
                            } else if (isNaN(answer)) {
                                error = 'Unable to score';
                            } else {
                                score = score + parseFloat(answer);
                            }
                        }
                    });
                }
                if (derRule.formula === 'mean') {
                    if (!isNaN(score)) {
                        score = score / derRule.inputs.length;
                    }
                }
            }
        });
        return {error: error, score: score};
    }


    evaluateSkipLogic(condition, parent, fe, nrs) {
        if (!condition) return true;
        let rule = condition.trim();
        if (rule.indexOf('OR') > -1) {
            return (this.evaluateSkipLogic(/.+OR/.exec(rule)[0].slice(0, -3), parent, fe, nrs) ||
                this.evaluateSkipLogic(/OR.+/.exec(rule)[0].substr(3), parent, fe, nrs));
        }
        if (rule.indexOf('AND') > -1) {
            return this.evaluateSkipLogic(/.+AND/.exec(rule)[0].slice(0, -4), parent, fe, nrs) &&
                this.evaluateSkipLogic(/AND.+/.exec(rule)[0].substr(4), parent, fe, nrs);
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
        let realAnswer;
        this.calculateScore(realAnswerObj, nrs.vm, newScore => {
            realAnswer = realAnswerObj.question.isScore ? newScore : realAnswerObj.question.answer;
        });
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
}
