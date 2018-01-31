import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';


@Injectable()
export class UcumService {
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
    validateUnits(uoms: string[], cb) {
        if (Array.isArray(uoms) && uoms.length)
            this.http.get<{ errors: string[], units: any[] }>('/ucumValidate?uoms=' + encodeURIComponent(JSON.stringify(uoms)))
                .subscribe(response => cb(response.errors, response.units));
        else cb([], []);
    }

    search = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(200),
            distinctUntilChanged(),
            switchMap(term => {
                if (term === '') return of([]);
                else return this.http.get('/ucumNames?uom=' + encodeURIComponent(term));
            })
        );

    formatter = (x: { name: string, synonyms: [any], code: string }) => '';

}