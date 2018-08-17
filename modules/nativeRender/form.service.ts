import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { DataElementService } from 'cde/public/dataElement.service';
import { CodeAndSystem, ObjectId } from 'shared/models.model';
import { DataElement } from 'shared/de/dataElement.model';
import { CdeForm, FormQuestion, PermissibleFormValue } from 'shared/form/form.model';

@Injectable()
export class FormService {
    constructor(
        private dataElementService: DataElementService,
        private http: HttpClient,
    ) {}

    // TODO: use Mongo cde and move to shared, currently open to using Elastic cde
    convertCdeToQuestion(de: DataElement, cb: (q?: FormQuestion) => void): void {
        if (!de || de.valueDomain === undefined) {
            throw new Error('Cde ' + de.tinyId + ' is not valid');
        }

        let q = new FormQuestion();
        q.question.cde.derivationRules = de.derivationRules;
        q.question.cde.name = de.designations[0] ? de.designations[0].designation : '';
        q.question.cde.designations = de.designations;
        q.question.cde.definitions = de.definitions;
        q.question.cde.permissibleValues = [];
        q.question.cde.tinyId = de.tinyId;
        q.question.cde.version = de.version;
        q.question.datatype = de.valueDomain.datatype;
        q.question.datatypeDate = de.valueDomain.datatypeDate;
        if (!q.question.datatypeDate) q.question.datatypeDate = {};
        q.question.datatypeNumber = de.valueDomain.datatypeNumber;
        q.question.datatypeText = de.valueDomain.datatypeText;
        if (de.ids) {
            q.question.cde.ids = de.ids;
        }
        if (de.valueDomain.uom) {
            q.question.unitsOfMeasure.push(new CodeAndSystem('', de.valueDomain.uom));
        }

        de.designations.forEach(n => {
            if (Array.isArray(n.tags) && n.tags.indexOf('Question Text') > -1 && !q.label) {
                q.label = n.designation;
            }
        });
        if (!q.label) {
            q.label = de.designations[0].designation;
        }
        if (!q.label) q.hideLabel = true;

        function convertPv(q: FormQuestion, cde: DataElement) {
            cde.valueDomain.permissibleValues.forEach(pv => {
                if (!pv.valueMeaningName || pv.valueMeaningName.trim().length === 0) {
                    pv.valueMeaningName = pv.permissibleValue;
                }
                q.question.answers.push(Object.assign({formElements: []}, pv));
                q.question.cde.permissibleValues.push(pv);
            });
        }
        if (de.valueDomain.permissibleValues.length > 0) {
            // elastic only store 10 pv, retrieve pv when have more than 9 pv.
            if (de.valueDomain.permissibleValues.length > 9) {
                this.dataElementService.fetchDe(de.tinyId, de.version || '').then(de => {
                    convertPv(q, de);
                    cb(q);
                }, cb);
            } else {
                convertPv(q, de);
                cb(q);
            }
        } else {
            cb(q);
        }
    }

    fetchForm(tinyId: string, version?: string): Promise<CdeForm> {
        return new Promise<CdeForm>((resolve, reject) => {
            if (version || version === '') {
                this.http.get<CdeForm>('/form/' + tinyId + '/version/' + version).subscribe(resolve, reject);
            } else {
                this.http.get<CdeForm>('/form/' + tinyId).subscribe(resolve, reject);
            }
        });
    }

    fetchFormById(id: ObjectId): Promise<CdeForm> {
        return new Promise<CdeForm>((resolve, reject) => {
            this.http.get<CdeForm>('/formById/' + id).subscribe(resolve, reject);
        });
    }
}
