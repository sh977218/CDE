import { Injectable } from '@angular/core';
import { findQuestionByTinyId, getFormScoreQuestions } from 'core/form/fe';
import { CdeForm, FormQuestion } from 'shared/form/form.model';
import { CbErr } from 'shared/models.model';

interface ErrorOrScore {
    error?: string;
    sum?: number;
}

@Injectable()
export class ScoreService {
    INPUT_SCORE_MAP!: Map<string, FormQuestion[]>;
    elt!: CdeForm;

    register(elt: CdeForm) {
        // register all scores used by one question tinyId
        this.elt = elt;
        this.INPUT_SCORE_MAP = new Map<string, FormQuestion[]>();
        const formScoreQuestions = getFormScoreQuestions(elt);
        formScoreQuestions.forEach(formScoreQuestion => {
            formScoreQuestion.question.cde.derivationRules.forEach(derivationRule => {
                derivationRule.inputs.forEach(cdeTinyId => {
                    let scores = this.INPUT_SCORE_MAP.get(cdeTinyId);
                    if (!scores) {
                        scores = [];
                        this.INPUT_SCORE_MAP.set(cdeTinyId, scores);
                    }
                    scores.push(formScoreQuestion);
                });
            });
        });
    }

    triggerCalculateScore(question: FormQuestion) {
        const scoreQuestions: FormQuestion[] | undefined = this.INPUT_SCORE_MAP.get(question.question.cde.tinyId);
        if (scoreQuestions) {
            scoreQuestions.forEach(scoreQuestion => ScoreService.scoreSet(scoreQuestion, this.elt));
        }
    }

    static calculateScore(question: FormQuestion, elt: CdeForm, cb: CbErr<number>) {
        if (!question.question.isScore) {
            return;
        }
        question.question.cde.derivationRules.forEach(async derRule => {
            if (derRule.ruleType === 'score') {
                if (derRule.formula === 'sumAll') {
                    const {error, sum} = ScoreService.sum(derRule.inputs, elt);
                    return cb(error, sum);
                }
                if (derRule.formula === 'mean') {
                    const result = ScoreService.sum(derRule.inputs, elt);
                    return cb(result.error, result.sum !== undefined && !Number.isNaN(result.sum)
                        ? result.sum / derRule.inputs.length
                        : result.sum
                    );
                }
                if (derRule.formula === 'bmi') {
                    const aQuestion = findQuestionByTinyId(derRule.inputs[0], elt);
                    if (!aQuestion) {
                        return cb('Cannot find ' + derRule.inputs[0] + ' in form ' + elt.tinyId);
                    }
                    let aAnswer = parseFloat(aQuestion.question.answer);
                    if (isNaN(aAnswer)) {
                        return cb('Incomplete answers');
                    }
                    if (!aQuestion.question.answerUom) {
                        return cb('Select unit of measurement for weight');
                    }

                    const bQuestion = findQuestionByTinyId(derRule.inputs[1], elt);
                    if (!bQuestion) {
                        return cb('Cannot find ' + derRule.inputs[1] + ' in form ' + elt.tinyId);
                    }
                    let bAnswer = parseFloat(bQuestion.question.answer);
                    if (isNaN(bAnswer)) {
                        return cb('Incomplete answers');
                    }
                    if (!bQuestion.question.answerUom) {
                        return cb('Select unit of measurement for height');
                    }

                    Promise.all([
                        ScoreService.ucumConverter(aAnswer, aQuestion.question.answerUom.code, 'kg'),
                        ScoreService.ucumConverter(bAnswer, bQuestion.question.answerUom.code, 'm')
                    ]).then(values => {
                        [aAnswer, bAnswer] = values;
                        cb(undefined, aAnswer / (bAnswer * bAnswer));
                    });
                }
            }
        });
    }

    static scoreSet(question: FormQuestion, elt: CdeForm) {
        ScoreService.calculateScore(question, elt, (err?: string, sum?: number) => {
            if (err) {
                question.question.scoreError = err;
            } else {
                question.question.answer = sum;
                question.question.scoreError = undefined;
            }
        });
    }

    static sum(tinyIds: string[], elt: CdeForm): ErrorOrScore {
        let error = '';
        let sum = 0;
        tinyIds.forEach(cdeTinyId => {
            const q = findQuestionByTinyId(cdeTinyId, elt);
            if (!q) {
                return error = 'Cannot find ' + cdeTinyId + ' in form ' + elt.tinyId;
            }
            const answer = parseFloat(q.question.answer);
            if (isNaN(answer)) {
                return error = 'Incomplete answers';
            }
            sum += answer;
        });
        return {error, sum};
    }

    static ucumConverter(value: number, from?: string, to?: string) {
        return fetch('/ucumConvert?value=' + value + '&from=' + from + '&to=' + to)
            .then(res => res.json());
    }
}
