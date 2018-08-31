import { Injectable } from '@angular/core';
import { findQuestionByTinyId, getFormScoreQuestion } from '../../shared/form/formShared';
import { FormQuestion } from '../../shared/form/form.model';

@Injectable()
export class ScoreService {
    INPUT_SCORE_MAP = new Map<string, [Object]>();
    elt;

    register(elt) {
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
        scoreQuestions.forEach(scoreQuestion => {
            this.calculateScore(scoreQuestion);
        });
    }

    /**
     * @param {FormQuestion}scoreQuestion FormQuestion which is score
     */
    calculateScore(scoreQuestion: FormQuestion) {
        if (!scoreQuestion.question.isScore) return;
        scoreQuestion.question.cde.derivationRules.forEach(derRule => {
            if (derRule.ruleType === 'score') {
                if (derRule.formula === 'sumAll') {
                    derRule.inputs.forEach(cdeTinyId => {
                        let q = findQuestionByTinyId(cdeTinyId, this.elt);
                        if (!q) {
                            scoreQuestion.question.scoreError = 'Can not find ' + cdeTinyId + ' in form ' + this.elt.tinyId;
                            return;
                        }
                        let answer = q.question.answer;
                        if (isNaN(answer)) {
                            scoreQuestion.question.scoreError = 'Unable to score ' + cdeTinyId;
                            return;
                        }
                        if (typeof scoreQuestion.question.score !== 'undefined') scoreQuestion.question.score = parseFloat(answer);
                        scoreQuestion.question.score = scoreQuestion.question.score + parseFloat(answer);
                    });
                }
                if (derRule.formula === 'mean') {
                    derRule.inputs.forEach(cdeTinyId => {
                        let q = findQuestionByTinyId(cdeTinyId, this.elt);
                        if (!q) {
                            scoreQuestion.question.scoreError = 'Can not find ' + cdeTinyId + ' in form ' + this.elt.tinyId;
                            return;
                        }
                        let answer = q.question.answer;
                        if (isNaN(answer)) {
                            scoreQuestion.question.scoreError = 'Unable to score ' + cdeTinyId;
                            return;
                        }
                        if (typeof scoreQuestion.question.score !== 'undefined') q.question.score = parseFloat(answer);
                        scoreQuestion.question.score = scoreQuestion.question.score + parseFloat(answer);
                    });
                    scoreQuestion.question.score = scoreQuestion.question.score / derRule.inputs.length;
                }
            }
        });
    }
}