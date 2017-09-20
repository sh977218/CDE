import { Http } from "@angular/http";
import { Component, Inject, OnInit } from "@angular/core";

import "rxjs/add/operator/map";
import "rxjs/add/operator/debounceTime";
import "rxjs/add/operator/distinctUntilChanged";

//noinspection TypeScriptCheckImport
import { Observable } from "rxjs/Rx";
import { AlertService } from "../../alert/alert.service";

@Component({
    selector: "cde-edit-site-admins",
    templateUrl: "./editSiteAdmins.component.html"
})

export class EditSiteAdminsComponent implements OnInit {

    newAdmin: any;
    siteAdmins: any = [];

    constructor(private http: Http,
                private Alert: AlertService) {}

    ngOnInit() {
        this.getSiteAdmins();
    }

    searchTypeahead = (text$: Observable<string>) =>
        text$.debounceTime(300).distinctUntilChanged().switchMap(term => term.length < 3 ? [] :
            this.http.get("/searchUsers/" + term).map(r => r.json()).map(r => r.users.map(u => u.username))
                .catch(() =>  Observable.of([]))
        );

    addSiteAdmin () {
        this.http.post('/addSiteAdmin', {username: this.newAdmin.username}).subscribe(() => {
            this.Alert.addAlert("success", "Saved");
            this.getSiteAdmins();
        }, () => this.Alert.addAlert("danger", "There was an issue adding this administrator.")
        );
        this.newAdmin.username = "";
    };

    removeSiteAdmin (byId) {
        this.http.post('/removeSiteAdmin', {id: byId}).subscribe(() => {
                this.Alert.addAlert("success", "Removed");
                this.getSiteAdmins();
            }, () => {
                this.Alert.addAlert("danger", "There was an issue removing this administrator.");
            }
        );
    };

    getSiteAdmins () {
        this.http.get("/siteAdmins").map(r => r.json()).subscribe(response => this.siteAdmins = response);
    };

}