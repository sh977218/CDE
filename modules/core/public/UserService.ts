import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import { Observable } from "rxjs/Rx";
import "rxjs/add/operator/map";

@Injectable()
export class UserService {
    constructor(private http: Http) {
    }

    search(term: string) {
        if (term === "") {
            //noinspection TypeScriptUnresolvedFunction
            return Observable.of([]);
        }

        //noinspection TypeScriptValidateTypes
        return this.http.get("/searchUsers/" + term).map(r => r.json()).map(r => r.users);
    }
}