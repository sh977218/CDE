import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';

@Injectable()
export class UcumService {
    uomUnitMap = new Map<string, string[]>();

    constructor(private http: Http) {
    }

    // cb(error, number)
    convertUnits(value: number, fromUnit: string, toUnit: string, cb) {
        this.http.get('/ucumConvert?value=' + value + '&from=' + encodeURIComponent(fromUnit) + '&to='
            + encodeURIComponent(toUnit)).map(r => r.json()).subscribe(v => cb(undefined, v), e => cb(e));
    }

    // cb(errors, units)
    validateUnits(uoms: string[], cb) {
        if (Array.isArray(uoms) && uoms.length)
            this.http.get('/ucumValidate?uoms=' + encodeURIComponent(JSON.stringify(uoms))).map(r => r.json())
                .subscribe(response => cb(response.errors, response.units));
        else
            cb([], []);
    }

    // cb(names)
    getUnitNames(uom: string, cb) {
        let match = this.uomUnitMap.get(uom);
        if (match)
            return cb(match);

        this.http.get('/ucumSynonyms?uom=' + encodeURIComponent(uom)).map(r => r.json()).subscribe(response => {
            if (Array.isArray(response)) {
                this.uomUnitMap.set(uom, response);
                return cb(response);
            }
            return cb([]);
        });
    }

    search = (text$: Observable<string>) =>
        text$.debounceTime(200).distinctUntilChanged()
            .switchMap(term => {
                if (term === '') return of([]);
                else return this.http.get('/ucumNames?uom=' + encodeURIComponent(term)).map(r => r.json());
            });

    formatter = (x: { name: string, synonyms: [any] }) => '';
}