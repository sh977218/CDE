import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import noop from 'lodash.noop';

import {
    areDerivationRulesSatisfied, convertFormToSection, findQuestionByTinyId, isSubForm, iterateFe, iterateFes,
    iterateFeSync, iterateFesSync, score
} from 'form/shared/formShared';
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
        if (cde.valueDomain === undefined)
            throw new Error('Cde ' + cde.tinyId + ' is not valid');

        let q = new FormQuestion;
        q.question.cde.derivationRules = cde.derivationRules;
        q.question.cde.name = cde.naming[0] ? cde.naming[0].designation : '';
        q.question.cde.permissibleValues = cde.valueDomain.permissibleValues;
        q.question.cde.tinyId = cde.tinyId;
        q.question.cde.version = cde.version;
        q.question.datatype = cde.valueDomain.datatype;
        q.question.datatypeDate = cde.valueDomain.datatypeDate;
        q.question.datatypeNumber = cde.valueDomain.datatypeNumber;
        q.question.datatypeText = cde.valueDomain.datatypeText;
        if (cde.ids)
            q.question.cde.ids = cde.ids;
        if (cde.valueDomain.uom)
            q.question.uoms.push(cde.valueDomain.uom);

        cde.naming.forEach(n => {
            if (Array.isArray(n.tags) && n.tags.indexOf('Question Text') > -1)
                q.label = n.designation;
        });
        if (!q.label)
            q.label = cde.naming[0].designation;
        if (!q.label)
            q.hideLabel = true;

        function convertPv(q, cde) {
            cde.valueDomain.permissibleValues.forEach(pv => {
                if (!pv.valueMeaningName || pv.valueMeaningName.trim().length === 0) {
                    pv.valueMeaningName = pv.permissibleValue;
                }
                q.question.answers.push(pv);
                q.question.cde.permissibleValues.push(pv);
            });
        }
        if (cde.valueDomain.permissibleValues.length > 0) {
            // elastic only store 10 pv, retrieve pv when have more than 9 pv.
            if (cde.valueDomain.permissibleValues.length > 9) {
                this.http.get('/de/' + cde.tinyId + '/version/' + (cde.version ? cde.version : ''))
                    .map((res: Response) => res.json())
                    .subscribe((result) => {
                        convertPv(q, result);
                        cb(q);
                    }, err => cb());
                return;
            } else {
                convertPv(q, cde);
            }
        }

        return cb(q);
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
