import { Injectable } from '@angular/core';
import { findQuestionByTinyId, getFormScoreQuestions } from 'shared/form/fe';
import { CdeForm, FormQuestion } from 'shared/form/form.model';
import { HttpClient } from '@angular/common/http';
import { CbErr } from 'shared/models.model';

type ErrorOrScore = {error?: string, sum?: number};

@Injectable()
export class ScoreService {
    INPUT_SCORE_MAP!: Map<string, FormQuestion[]>;
    elt!: CdeForm;

    constructor(private http: HttpClient) {
    }

    register(elt: CdeForm) {
        // register all scores used by one question tinyId
        this.elt = elt;
        this.INPUT_SCORE_MAP = new Map<string, FormQuestion[]>();
        let formScoreQuestions = getFormScoreQuestions(elt);
        formScoreQuestions.forEach(formScoreQuestion => {
            formScoreQuestion.question.cde.derivationRules.forEach(derivationRule => {
                derivationRule.inputs.forEach(cdeTinyId => {
                    if (!this.INPUT_SCORE_MAP.has(cdeTinyId)) this.INPUT_SCORE_MAP.set(cdeTinyId, []);
                    this.INPUT_SCORE_MAP.get(cdeTinyId)!.push(formScoreQuestion);
                });
            });
        });
    }

    triggerCalculateScore(question: FormQuestion) {
        let scoreQuestions: FormQuestion[] | undefined = this.INPUT_SCORE_MAP.get(question.question.cde.tinyId);
        if (!!scoreQuestions) {
            scoreQuestions.forEach(scoreQuestion => this.scoreSet(scoreQuestion, this.elt));
        }
    }

    calculateScore(question: FormQuestion, elt: CdeForm, cb: CbErr<number>) {
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
                    let result = ScoreService.sum(derRule.inputs, elt);
                    return cb(result.error, result.sum !== undefined && !Number.isNaN(result.sum)
                        ? result.sum / derRule.inputs.length
                        : result.sum
                    );
                }
                if (derRule.formula === 'bmi') {
                    let aQuestion = findQuestionByTinyId(derRule.inputs[0], elt);
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

                    let bQuestion = findQuestionByTinyId(derRule.inputs[1], elt);
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

                    let aPromise = this.ucumConverter(aAnswer, aQuestion.question.answerUom.code, 'kg');
                    let bPromise = this.ucumConverter(bAnswer, bQuestion.question.answerUom.code, 'm');
                    Promise.all([aPromise, bPromise]).then(values => {
                        aAnswer = values[0];
                        bAnswer = values[1];
                        cb(undefined, aAnswer / (bAnswer * bAnswer));
                    });
                }
            }
        });
    }

    scoreSet(question: FormQuestion, elt: CdeForm) {
        this.calculateScore(question, elt, (err?: string, sum?: number) => {
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
            let q = findQuestionByTinyId(cdeTinyId, elt);
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

    ucumConverter(value: number, from?: string, to?: string) {
        return this.http.get<number>('/ucumConvert?value=' + value + '&from=' + from + '&to=' + to).toPromise();
    }
}
