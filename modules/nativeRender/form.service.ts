import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import _noop from 'lodash/noop';

import { CodeAndSystem } from 'shared/models.model';
import { FormQuestion } from 'shared/form/form.model';
import { iterateFe } from 'shared/form/formShared';


@Injectable()
export class FormService {
    constructor(
        private http: HttpClient
    ) {}

    convertCdeToQuestion(cde, cb): FormQuestion {
        if (!cde || cde.valueDomain === undefined) {
            throw new Error('Cde ' + cde.tinyId + ' is not valid');
        }

        let q = new FormQuestion();
        q.question.cde.derivationRules = cde.derivationRules;
        q.question.cde.name = cde.naming[0] ? cde.naming[0].designation : '';
        q.question.cde.naming = cde.naming;
        q.question.cde.permissibleValues = [];
        q.question.cde.tinyId = cde.tinyId;
        q.question.cde.version = cde.version;
        q.question.datatype = cde.valueDomain.datatype;
        q.question.datatypeDate = cde.valueDomain.datatypeDate;
        q.question.datatypeNumber = cde.valueDomain.datatypeNumber;
        q.question.datatypeText = cde.valueDomain.datatypeText;
        if (cde.ids) {
            q.question.cde.ids = cde.ids;
        }
        if (cde.valueDomain.uom) {
            q.question.unitsOfMeasure.push(new CodeAndSystem('', cde.valueDomain.uom));
        }

        cde.naming.forEach(n => {
            if (Array.isArray(n.tags) && n.tags.indexOf('Question Text') > -1 && !q.label) {
                q.label = n.designation;
            }
        });
        if (!q.label) {
            q.label = cde.naming[0].designation;
        }
        if (!q.label) q.hideLabel = true;

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

    // TODO: turn into single server endpoint that calls one of the 2 server-side implementations
    // modifies form to add sub-forms
    // callback(err: string)
    fetchWholeForm(form, callback = _noop) {
        let formCb = (fe, cb) => {
            this.http.get('/form/' + fe.inForm.form.tinyId
                + (fe.inForm.form.version ? '/version/' + fe.inForm.form.version : ''))
                .subscribe(function (response: any) {
                    fe.formElements = response.formElements;
                    cb();
                }, function (err) {
                    cb(err.statusText);
                });
        };
        function questionCb(fe, cb) {
            if (fe.question.cde.derivationRules) {
                fe.question.cde.derivationRules.forEach(derRule => {
                    delete fe.incompleteRule;
                    if (derRule.ruleType === 'score') {
                        fe.question.isScore = true;
                        fe.question.scoreFormula = derRule.formula;
                    }
                });
            }
            cb();
        }
        iterateFe(form, formCb, undefined, questionCb, callback);
    }

    // cb(err, elt)
    getForm(tinyId, id, cb = _noop) {
        let url = '/form/' + tinyId;
        if (id) url = '/formById/' + id;
        this.http.get(url).subscribe(res => {
            cb(null, res);
        }, cb);
    }
}
