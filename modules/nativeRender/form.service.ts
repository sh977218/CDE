import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import _noop from 'lodash/noop';

import { DataElementService } from 'cde/public/dataElement.service';
import { CodeAndSystem } from 'shared/models.model';
import { CdeForm, FormQuestion } from 'shared/form/form.model';
import { iterateFe } from 'shared/form/formShared';


@Injectable()
export class FormService {
    constructor(
        private dataElementService: DataElementService,
        private http: HttpClient,
    ) {}

    // TODO: use Mongo cde and move to shared, currently open to using Elastic cde
    convertCdeToQuestion(cde, cb: (q?: FormQuestion) => (void)): void {
        if (!cde || cde.valueDomain === undefined) {
            throw new Error('Cde ' + cde.tinyId + ' is not valid');
        }

        let q = new FormQuestion();
        q.question.cde.derivationRules = cde.derivationRules;
        q.question.cde.name = cde.designations[0] ? cde.designations[0].designation : '';
        q.question.cde.naming = cde.naming;
        q.question.cde.designations = cde.designations;
        q.question.cde.definitions = cde.definitions;
        q.question.cde.permissibleValues = [];
        q.question.cde.tinyId = cde.tinyId;
        q.question.cde.version = cde.version;
        q.question.datatype = cde.valueDomain.datatype;
        q.question.datatypeDate = cde.valueDomain.datatypeDate;
        if (!q.question.datatypeDate) q.question.datatypeDate = {};
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
            q.label = cde.designations[0].designation;
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
                this.dataElementService.fetchDe(cde.tinyId, cde.version || '').then(result => {
                    convertPv(q, result);
                    cb(q);
                }, cb);
            } else {
                convertPv(q, cde);
                cb(q);
            }
        } else {
            cb(q);
        }
    }

    fetchForm(tinyId, version = undefined): Promise<CdeForm> {
        return new Promise<CdeForm>((resolve, reject) => {
            if (version || version === '') {
                this.http.get<CdeForm>('/form/' + tinyId + '/version/' + version).subscribe(resolve, reject);
            } else {
                this.http.get<CdeForm>('/form/' + tinyId).subscribe(resolve, reject);
            }
        });
    }

    fetchFormById(id): Promise<CdeForm> {
        return new Promise<CdeForm>((resolve, reject) => {
            this.http.get('/formById/' + id).subscribe(resolve, reject);
        });
    }

    // TODO: turn into single server endpoint that calls one of the 2 server-side implementations
    // modifies form to add sub-forms
    // callback(err: string)
    fetchWholeForm(form, callback = _noop) {
        let formCb = (fe, cb) => {
            this.fetchForm(fe.inForm.form.tinyId, fe.inForm.form.version || '').then(
                response => {
                    fe.formElements = response.formElements;
                    cb();
                },
                err => cb(err.statusText)
            );
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
}
