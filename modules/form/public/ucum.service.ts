import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import _noop from 'lodash/noop';
import { Observable } from 'rxjs/Observable';
import { EmptyObservable } from 'rxjs/observable/EmptyObservable';
import { debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';

import { CodeAndSystem } from 'shared/models.model';

@Injectable()
export class UcumService {
    uomUnitMap = new Map<string, string[]>();

    constructor(private http: HttpClient) {
    }

    searchUcum(term) {
        return this.http.get('/ucumNames?uom=' + encodeURIComponent(term));
    }

    // cb(names)
    getUnitNames(uom: string, cb) {
        const match = this.uomUnitMap.get(uom);
        if (match) { return cb(match); }

        this.http.get('/ucumSynonyms?uom=' + encodeURIComponent(uom)).subscribe(response => {
            if (Array.isArray(response)) {
                this.uomUnitMap.set(uom, response);
                return cb(response);
            }
            return cb([]);
        });
    }

    // cb(errors, units)
    validateUcumUnits(unitsOfMeasure: CodeAndSystem[], cb) {
        if (Array.isArray(unitsOfMeasure) && unitsOfMeasure.length) {
            this.http.get<{ errors: string[], units: any[] }>('/ucumValidate?uoms=' + encodeURIComponent(JSON.stringify(unitsOfMeasure.map(u => u.code))))
                .subscribe(response => cb(response.errors, response.units), () => cb([], []));
        } else {
            cb([], []);
        }
    }

    // cb()
    validateUoms(question, cb = _noop) {
        const ucumUnits = question.unitsOfMeasure.filter(u => u.system === 'UCUM');
        question.uomsValid = [];
        this.validateUcumUnits(ucumUnits, errors => {
            ucumUnits.forEach((u, i) => {
                if (errors[i]) {
                    question.uomsValid[question.unitsOfMeasure.indexOf(u)] = errors[i];
                }
            });
            cb();
        });
    }
}
