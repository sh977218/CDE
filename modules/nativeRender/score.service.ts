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
        scoreQuestions.forEach(scoreQuestion => this.calculateScore(scoreQuestion));
    }

    /**
     * @param {FormQuestion}scoreQuestion FormQuestion which is score
     */
    calculateScore(scoreQuestion: FormQuestion) {
        if (!scoreQuestion.question.isScore) return;
        scoreQuestion.question.cde.derivationRules.forEach(derRule => {
            if (derRule.ruleType === 'score') {
                if (derRule.formula === 'sumAll') {
                    this.sum(derRule.inputs, (err, sum) => {
                        scoreQuestion.question.score = sum;
                        scoreQuestion.question.scoreError = err;
                    });
                }
                if (derRule.formula === 'mean') {
                    this.sum(derRule.inputs, (err, sum) => {
                        scoreQuestion.question.score = sum / derRule.inputs.length;
                        scoreQuestion.question.scoreError = err;
                    });
                }
            }
        });
    }

    sum(tinyIds, callback) {
        let sum = null;
        tinyIds.forEach(cdeTinyId => {
            let q = findQuestionByTinyId(cdeTinyId, this.elt);
            if (!q) return callback('Cannot find ' + cdeTinyId + ' in form ' + this.elt.tinyId);
            else {
                let qAnswer = q.question.answer;
                if (isNaN(qAnswer)) return callback('Unable to score ' + cdeTinyId);
                else {
                    let answer = parseFloat(qAnswer);
                    if (isNaN(sum)) sum = answer;
                    else sum = sum + answer;
                }
            }
        });
        callback(null, sum);
    }
}