import { Injectable } from '@angular/core';
import { findQuestionByTinyId } from '../../shared/form/formShared';

@Injectable()
export class ScoreService {
    question;
    elt;
    score: number;
    scoreError: string = '';

    calculateScore() {
        if (!this.question.question.isScore) return;
        this.question.question.cde.derivationRules.forEach(derRule => {
            if (derRule.ruleType === 'score') {
                if (derRule.formula === 'sumAll' || derRule.formula === 'mean') {
                    derRule.inputs.forEach(cdeTinyId => {
                        let q = findQuestionByTinyId(cdeTinyId, this.elt);
                        if (isNaN(this.score)) {
                            return;
                        }
                        if (q) {
                            let answer = q.question.answer;
                            if (typeof(answer) === "undefined" || answer === null) {
                                this.scoreError = 'Incomplete answers';
                            } else if (isNaN(answer)) {
                                this.scoreError = 'Unable to score';
                            } else {
                                this.score = this.score + parseFloat(answer);
                            }
                        }
                    });
                }
                if (derRule.formula === 'mean') {
                    if (!isNaN(this.score)) {
                        this.score = this.score / derRule.inputs.length;
                    }
                }
            }
        });
    }
}