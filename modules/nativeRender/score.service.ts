import { Injectable } from '@angular/core';
import { findQuestionByTinyId, getFormScoreQuestion } from '../../shared/form/fe';
import { FormQuestion } from '../../shared/form/form.model';

@Injectable()
export class ScoreService {
    INPUT_SCORE_MAP = new Map<string, [Object]>();
    elt;

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
        scoreQuestion.question.cde.derivationRules.forEach(derRule => {
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
}