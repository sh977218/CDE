import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import _noop from 'lodash/noop';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';

import { CodeAndSystem } from 'shared/models.model';


@Injectable()
export class UcumService {
    search = ((text$: Observable<string>) => text$.pipe(
        debounceTime(200),
        distinctUntilChanged(),
        switchMap(term => {
            if (term === '') return of([]);
            else {
                return this.http.get('/ucumNames?uom=' + encodeURIComponent(term)).pipe(
                    map((r: any[]) => {
                        if (!r.length) r.push({code: term, warning: "Not a valid UCUM unit"});
                        return r;
                    })
                );
            }
        })
    ));
    uomUnitMap = new Map<string, string[]>();

    constructor(private http: HttpClient) {
    }

    // cb(error, number)
    convertUnits(value: number, fromUnit: string, toUnit: string, cb) {
        this.http.get('/ucumConvert?value=' + value + '&from=' + encodeURIComponent(fromUnit) + '&to='
            + encodeURIComponent(toUnit)).subscribe(v => cb(undefined, v), e => cb(e));
    }

    // cb(names)
    getUnitNames(uom: string, cb) {
        let match = this.uomUnitMap.get(uom);
        if (match) return cb(match);

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
        let ucumUnits = question.unitsOfMeasure.filter(u => u.system === 'UCUM');
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
