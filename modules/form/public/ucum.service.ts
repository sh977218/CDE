import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';


@Injectable()
export class UcumService {
    uomNamesMap = new Map<string, string[]>();
    uomUnitMap = new Map<string, any[]>();

    constructor(private http: Http) {
    }

    getUnit(uom: string): Observable<any[]> {
        let match = this.uomUnitMap.get(uom);
        if (match !== undefined)
            return Observable.of(match);

        return this.getUnits(uom).map(r => {
            let index = r[3].reduce((acc, unit, i) => {
                if (acc > -1)
                    return acc;
                if (UcumService.isMatch(unit, uom))
                    return i;
                return -1;
            }, -1);
            let unit = index > -1 ? r[3][index] : [];
            this.uomUnitMap.set(uom, unit);
            return unit;
        });
    }

    getUnitNames(uom: string): Observable<string[]> {
        let match = this.uomNamesMap.get(uom);
        if (match !== undefined)
            return Observable.of(match);

        return this.getUnit(uom).map(unit => {
            let names = [unit[0], unit[1], ...unit[3].split(/[;,]/).map(u => u.trim())];
            this.uomNamesMap.set(uom, names);
            return names;
        });
    }

    getUnits(uom: string): Observable<any[]>  {
        return this.http.get(
            'https://clin-table-search.lhc.nlm.nih.gov/api/ucum/v3/search?q=is_simple:true%20AND%20category:Clinical&df=cs_code,name,guidance,synonyms&authenticity_token=&terms='
            + encodeURIComponent(uom)
        ).map(r => r.json());
    }

    static isMatch(unit, uom: string): boolean {
        return unit[0] === uom || unit[1] === uom || unit[3].split(/[;,]/).some(u => u.trim() === uom);
    }
}