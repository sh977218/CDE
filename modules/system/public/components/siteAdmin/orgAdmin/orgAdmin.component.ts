import { Http } from "@angular/http";
import { Component, Inject, OnInit } from "@angular/core";
import "rxjs/add/operator/map";
import "rxjs/add/operator/debounceTime";

import { Observable } from "rxjs/Rx";

@Component({
    selector: "cde-org-admin",
    templateUrl: "./orgAdmin.component.html"
})

export class OrgAdminComponent implements OnInit {

    newAdmin: any = {orgName: ""};
    orgAdmins: any[] = [{name: "Loading..."}];

    constructor(
        private http: Http,
        @Inject("Alert") private Alert,
        @Inject("userResource") private userService,
        @Inject("isAllowedModel") public isAllowedModel
    ) {
    }

    searchTypeahead = (text$: Observable<string>) =>
        text$.debounceTime(300).distinctUntilChanged().switchMap(term => term.length < 3 || !this.isAllowedModel.hasRole("OrgAuthority") ? [] :
            this.http.get("/searchUsers/" + term).map(r => r.json()).map(r => r.users)
                .catch(() => {
                    //noinspection TypeScriptUnresolvedFunction
                    return Observable.of([]);
                })
        )

    formatter = (result: any) => result.username;

    setOrgs (r)  {
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

    ngOnInit() {
        this.getAdmins();
    }

    removeOrgAdmin (orgName, userId) {
        if (this.userService.user._id === userId) {
            let answer = confirm("Please confirm that you want to remove yourself from the list of admins. You will be redirected to the home page. ");
            if (!answer) return;
        } else {
            this.http.post("/removeOrgAdmin", {
                orgName: orgName
                , userId: userId
            }).subscribe(r => {
                this.Alert.addAlert("success", r.text());
                this.getAdmins();
                if (this.userService.user._id === userId) {
                    location.assign("/");
                }
            }, () => this.Alert.alert("An error occured."));
        }
    }

    addOrgAdmin () {
        this.http.post("/addOrgAdmin", {
            username: this.newAdmin.username
            , org: this.newAdmin.orgName
        }).subscribe(r => {
            this.Alert.addAlert("success", r.text());
            this.getAdmins();
        }, () => this.Alert.addAlert("danger", "There was an issue adding this administrator."));
        this.newAdmin.username = "";
    };

}