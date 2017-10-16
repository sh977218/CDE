import { Http } from "@angular/http";
import { Component, OnInit } from "@angular/core";
import "rxjs/add/operator/map";
import "rxjs/add/operator/debounceTime";

import { Observable } from "rxjs/Rx";
import { IsAllowedService } from 'core/public/isAllowed.service';
import { AlertService } from '_app/alert/alert.service';

@Component({
    selector: "cde-org-admin",
    templateUrl: "./orgAdmin.component.html"
})

export class OrgAdminComponent implements OnInit {

    newAdmin: any = {orgName: "", username: ""};
    orgAdmins: any[] = [{name: "Loading..."}];

    constructor(
        private http: Http,
        private alert: AlertService,
        public isAllowedModel: IsAllowedService) {}

    ngOnInit() {
        this.getAdmins();
    }

    searchTypeahead = (text$: Observable<string>) =>
        text$.debounceTime(300).distinctUntilChanged()
            .switchMap(term => term.length < 3 || !this.isAllowedModel.hasRole("OrgAuthority") ? [] :
            this.http.get("/searchUsers/" + term).map(r => r.json()).map(r => r.users.map(u => u.username))
                .catch(() => Observable.of([]))
        );
    formatter = (result: any) => result.username;

    setOrgs (r) {
        this.orgAdmins = r.orgs;
        if (this.orgAdmins && this.orgAdmins.length === 1) this.newAdmin.orgName = this.orgAdmins[0].name;
    }

    getAdmins () {
        if (this.isAllowedModel.hasRole("OrgAuthority")) {
            return this.http.get("/orgAdmins").map(r => r.json()).subscribe(r => this.setOrgs(r));
        } else {
            return this.http.get("/myOrgsAdmins").map(r => r.json()).subscribe(r => this.setOrgs(r));
        }
    }

    removeOrgAdmin (orgName, userId) {
        this.http.post("/removeOrgAdmin", {
            orgName: orgName
            , userId: userId
        }).subscribe(() => {
            this.alert.addAlert("success", "Removed");
            this.getAdmins();
        }, () => this.alert.addAlert("danger", "An error occured."));
    }

    addOrgAdmin () {
        this.http.post("/addOrgAdmin", {
            username: this.newAdmin.username
            , org: this.newAdmin.orgName
        }).subscribe(() => {
            this.alert.addAlert("success", "Saved");
            this.getAdmins();
        }, () => this.alert.addAlert("danger", "There was an issue adding this administrator."));
        this.newAdmin.username = "";
    }

}