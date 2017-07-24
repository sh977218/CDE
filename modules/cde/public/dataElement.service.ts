import { Injectable } from "@angular/core";
import { Http } from "@angular/http";

@Injectable()
export class DataElementService {
    elt;
    constructor(private http: Http) {
    }

    save(elt) {
        let url = "";
        return this.http.post(url, elt);
    }

    get(tinyId) {
        let url = "/dataElement/" + tinyId;
        return this.http.get(url).map(res => res.json());
    }

}
