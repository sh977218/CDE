import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as _noop from 'lodash/noop';
import { Question } from 'shared/form/form.model';
import { Cb1, Cb2, CodeAndSystem } from 'shared/models.model';

export interface UcumSynonyms {
    code: string;
    name: string;
    synonyms: string[];
}

@Injectable()
export class UcumService {
    uomUnitMap = new Map<string, string[]>();

    constructor(private http: HttpClient) {
    }

    searchUcum(term: string) {
        return this.http.get<UcumSynonyms[]>('/server/ucumNames?uom=' + encodeURIComponent(term));
    }

    getUnitNames(uom: string, cb: Cb1<string[]>) {
        const match = this.uomUnitMap.get(uom);
        if (match) { return cb(match); }

        this.http.get('/server/ucumSynonyms?uom=' + encodeURIComponent(uom)).subscribe(response => {
            if (Array.isArray(response)) {
                this.uomUnitMap.set(uom, response);
                return cb(response);
            }
            return cb([]);
        });
    }

    validateUcumUnits(unitsOfMeasure: CodeAndSystem[], cb: Cb2<string[], string[]>) {
        if (Array.isArray(unitsOfMeasure) && unitsOfMeasure.length) {
            this.http.post<{ errors: string[], units: any[] }>('/server/ucumValidate',
                {uoms: unitsOfMeasure.map(u => u.code)})
                .subscribe(response => cb(response.errors, response.units), () => cb([], []));
        } else {
            cb([], []);
        }
    }

    // cb()
    validateUoms(question: Question, cb = _noop) {
        const ucumUnits = question.unitsOfMeasure.filter((u: CodeAndSystem) => u.system === 'UCUM');
        question.uomsValid = [];
        this.validateUcumUnits(ucumUnits, errors => {
            ucumUnits.forEach((u: CodeAndSystem, i: number) => {
                if (errors[i]) {
                    question.uomsValid[question.unitsOfMeasure.indexOf(u)] = errors[i];
                }
            });
            cb();
        });
    }
}
