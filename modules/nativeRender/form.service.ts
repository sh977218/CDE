import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

import {
    areDerivationRulesSatisfied, convertFormToSection, findQuestionByTinyId, isSubForm, iterateFe, iterateFes,
    iterateFeSync, iterateFesSync, score
} from 'form/shared/formShared';
import noop from 'lodash.noop';
import { FormQuestion } from 'core/form.model';

function noop1(a, cb) { cb(); }

@Injectable()
export class FormService {
    constructor(private http: Http) {}

    static areDerivationRulesSatisfied = areDerivationRulesSatisfied;
    static convertFormToSection = convertFormToSection;
    static findQuestionByTinyId = findQuestionByTinyId;
    static isSubForm = isSubForm;
    static iterateFe = iterateFe;
    static iterateFeSync = iterateFeSync;
    static iterateFes = iterateFes;
    static iterateFesSync = iterateFesSync;
    static score = score;

    convertCdeToQuestion(cde, cb): FormQuestion {
        if (cde.valueDomain !== undefined) {
            let question = {
                elementType: 'question',
                label: cde.naming[0].designation,
                hideLabel: undefined,
                skipLogic: {
                    condition: ''
                },
                question: {
                    cde: {
                        tinyId: cde.tinyId,
                        version: cde.version,
                        derivationRules: cde.derivationRules,
                        name: cde.naming[0] ? cde.naming[0].designation : '',
                        ids: cde.ids ? cde.ids : [],
                        permissibleValues: []
                    },
                    datatype: cde.valueDomain.datatype,
                    datatypeDate: undefined,
                    datatypeNumber: undefined,
                    datatypeText: undefined,
                    required: false,
                    uoms: cde.valueDomain.uom ? [cde.valueDomain.uom] : [],
                    answers: []
                }
            };
            cde.naming.forEach(function (n) {
                if (!n.tags) n.tags = [];
                if (n.tags.filter(function (t) {
                        return t.toLowerCase().indexOf('Question Text') > 0;
                    }).length > 0) {
                    if (!n.designation || (n.designation && n.designation.trim().length === 0)) {
                        question.label = cde.naming[0].designation ? cde.naming[0].designation : '';
                        question.hideLabel = true;
                    } else {
                        question.label = n.designation;
                    }
                }
            });

            if (question.question.datatype === 'Number') {
                question.question.datatypeNumber = cde.valueDomain.datatypeNumber ? cde.valueDomain.datatypeNumber : {};
            } else if (question.question.datatype === 'Text') {
                question.question.datatypeText = cde.valueDomain.datatypeText ? cde.valueDomain.datatypeText : {};
            } else if (question.question.datatype === 'Date') {
                question.question.datatypeDate = cde.valueDomain.datatypeDate ? cde.valueDomain.datatypeDate : {};
            } else if (question.question.datatype === 'Value List') {
                if (cde.valueDomain.permissibleValues.length > 0) {
                    // elastic only store 10 pv, retrieve pv when have more than 9 pv.
                    if (cde.valueDomain.permissibleValues.length > 9) {
                        this.http.get('/de/' + cde.tinyId + '/version/' + (cde.version ? cde.version : ''))
                            .map((res: Response) => res.json())
                            .subscribe((result) => {
                                result.valueDomain.permissibleValues.forEach(function (pv) {
                                    if (!pv.valueMeaningName || pv.valueMeaningName.trim().length === 0) {
                                        pv.valueMeaningName = pv.permissibleValue;
                                    }
                                    question.question.answers.push(pv);
                                    question.question.cde.permissibleValues.push(pv);
                                });
                                cb(question);
                            }, err => cb());
                        return;
                    } else {
                        cde.valueDomain.permissibleValues.forEach(function (pv) {
                            if (!pv.valueMeaningName || pv.valueMeaningName.trim().length === 0) {
                                pv.valueMeaningName = pv.permissibleValue;
                            }
                            question.question.answers.push(pv);
                            question.question.cde.permissibleValues.push(pv);
                        });
                    }
                }
            }
            return cb(question);
        }
        else {
            return cb({});
        }
    }

    // modifies form to add sub-forms
    // callback(err: string)
    fetchWholeForm(form, callback = noop) {
        let formCb = (fe, cb) => {
            this.http.get('/form/' + fe.inForm.form.tinyId
                + (fe.inForm.form.version ? '/version/' + fe.inForm.form.version : ''))
                .map(function (res) {
                    return res.json();
                })
                .subscribe(function (response: any) {
                    fe.formElements = response.formElements;
                    cb();
                }, function (err) {
                    cb(err.statusText);
                });
        };
        function questionCb(fe, cb) {
            if (fe.question.cde.derivationRules)
                fe.question.cde.derivationRules.forEach(function (derRule) {
                    delete fe.incompleteRule;
                    if (derRule.ruleType === 'score') {
                        fe.question.isScore = true;
                        fe.question.scoreFormula = derRule.formula;
                    }
                });
            cb();
        }
        FormService.iterateFe(form, callback, formCb, undefined, questionCb);
    }

    // cb(err, elt)
    getForm(tinyId, id, cb = noop) {
        let url = '/form/' + tinyId;
        if (id) url = '/formById/' + id;
        this.http.get(url).map(res => res.json()).subscribe(res => {
            cb(null, res);
        }, cb);
    }
}
