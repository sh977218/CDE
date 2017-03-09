/*
import { Injectable } from "@angular/core";
import { Http } from "@angular/http";

@Injectable()
export class MergeCdeService {
    constructor(private http:Http) {
    }

    private getCdeByTinyId(tinyId) {
        this.http.get('/debytinyid/' + tinyId).map((res) => res.json());
    }

    public mergeCde(from, to, fields) {
        this.getCdeByTinyId(from).subscribe((cde)=> {
            let cdeFrom = cde;
        }, (err) => {
            console.log('unable to get cde ' + tinyId);
        });
        this.getCdeByTinyId(to).subscribe((cde)=> {
            let cdeInto = cde;
        }, (err) => {
            console.log('unable to get cde ' + tinyId);
        });
        Object.keys(fields).forEach((field)=> {
            cdeInto[p] = cdeInto[p].concat(cdeFrom[p]);
        });
        return to;
    }
}
*/
