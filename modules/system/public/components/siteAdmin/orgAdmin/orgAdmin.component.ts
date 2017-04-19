import { Http } from "@angular/http";
import { Component } from "@angular/core";
import "rxjs/add/operator/map";
import "rxjs/add/operator/debounceTime";

import { Observable } from "rxjs/Rx";

@Component({
    selector: "cde-org-admin",
    templateUrl: "./orgAdmin.component.html"
})

export class OrgAdminComponent {

    constructor(private http: Http) {
    }

    searchTypeahead = (text$: Observable<string>) =>
        text$.debounceTime(300).distinctUntilChanged().switchMap(term => term.length < 3 ? [] :
            this.http.get("/searchUsers/" + term).map(r => r.json()).map(r => r.users)
                .catch(() => {
                    //noinspection TypeScriptUnresolvedFunction
                    return Observable.of([]);
                })
        )

}