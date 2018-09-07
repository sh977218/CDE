import { Injectable } from '@angular/core';
import { findQuestionByTinyId, getFormScoreQuestion } from '../../shared/form/fe';
import { FormQuestion } from '../../shared/form/form.model';
import async_series from 'async/series';
import { HttpClient } from '@angular/common/http';
import { AlertService } from '_app/alert.service';

@Injectable()
export class ScoreService {
    INPUT_SCORE_MAP = new Map<string, [Object]>();
    elt;

    constructor(private http: HttpClient,
                private alert: AlertService) {
    }

    register(elt) {
        // register all scores used by one question tinyId
        this.elt = elt;
        let formScoreQuestions = getFormScoreQuestion(elt);
        formScoreQuestions.forEach(formScoreQuestion => {
            formScoreQuestion.question.cde.derivationRules.forEach(derivationRule => {
                derivationRule.inputs.forEach(cdeTinyId => {
                    if (!this.INPUT_SCORE_MAP[cdeTinyId]) this.INPUT_SCORE_MAP[cdeTinyId] = [];
                    this.INPUT_SCORE_MAP[cdeTinyId].push(formScoreQuestion);
                });
            });
        });
    }


    /**
     * @param {FormQuestion}inputQuestion FormQuestion which is input
     */
    triggerCalculateScore(inputQuestion: FormQuestion) {
        let scoreQuestions = this.INPUT_SCORE_MAP[inputQuestion.question.cde.tinyId];
        if (scoreQuestions) scoreQuestions.forEach(scoreQuestion => this.calculateScore(scoreQuestion));
    }

    /**
     * @param {FormQuestion}scoreQuestion FormQuestion which is score
     */
    calculateScore(scoreQuestion: FormQuestion) {
        if (!scoreQuestion.question.isScore) return;
        scoreQuestion.question.cde.derivationRules.forEach(async derRule => {
            if (derRule.ruleType === 'score') {
                if (derRule.formula === 'sumAll') {
                    let result: any = this.sum(derRule.inputs);
                    scoreQuestion.question.answer = result.sum;
                    scoreQuestion.question.scoreError = result.error;
                }
                if (derRule.formula === 'mean') {
                    let result: any = this.sum(derRule.inputs);
                    scoreQuestion.question.answer = result.sum / derRule.inputs.length;
                    scoreQuestion.question.scoreError = result.error;
                }
                if (derRule.formula === 'bmi') {
                    let aQuestion = findQuestionByTinyId(derRule.inputs[0], this.elt);
                    if (!aQuestion) scoreQuestion.question.scoreError = 'Cannot find ' + derRule.inputs[0] + ' in form ' + this.elt.tinyId;
                    let aAnswer = parseFloat(aQuestion.question.answer);
                    if (isNaN(aAnswer)) scoreQuestion.question.scoreError = "Incomplete answers";
                    if (!aQuestion.question.answerUom) return scoreQuestion.question.scoreError = 'Select unit of measurement for weight';
                    else scoreQuestion.question.scoreError = '';
                    let bQuestion = findQuestionByTinyId(derRule.inputs[1], this.elt);
                    if (!bQuestion) scoreQuestion.question.scoreError = 'Cannot find ' + derRule.inputs[1] + ' in form ' + this.elt.tinyId;
                    let bAnswer = parseFloat(bQuestion.question.answer);
                    if (isNaN(bAnswer)) scoreQuestion.question.scoreError = "Incomplete answers";
                    if (!bQuestion.question.answerUom) return scoreQuestion.question.scoreError = 'Select unit of measurement for height';
                    else scoreQuestion.question.scoreError = '';

                    if (aAnswer && bAnswer) {
                        let aPromise = this.ucumConvter(aAnswer, aQuestion.question.answerUom.code, 'kg');
                        let bPromise = this.ucumConvter(bAnswer, bQuestion.question.answerUom.code, 'm');
                        Promise.all([aPromise, bPromise]).then(values => {
                            aAnswer = values[0];
                            bAnswer = values[1];
                            scoreQuestion.question.answer = aAnswer / (bAnswer * bAnswer);
                            scoreQuestion.question.scoreError = '';
                        });
                    }
                }
            }
        });
    }

    sum(tinyIds) {
        let sum = null;
        for (let cdeTinyId of tinyIds) {
            let q = findQuestionByTinyId(cdeTinyId, this.elt);
            if (!q) return {error: 'Cannot find ' + cdeTinyId + ' in form ' + this.elt.tinyId};
            else {
                let answer = parseFloat(q.question.answer);
                if (isNaN(answer)) return {error: "Incomplete answers"};
                else {
                    if (isNaN(sum)) sum = answer;
                    else sum = sum + answer;
                }
            }
        }
        return {sum: sum};
    }

    ucumConvter(value, from, to) {
        return this.http.get<number>('/ucumConvert?value=' + value + '&from=' + from + '&to=' + to).toPromise();
    }
}