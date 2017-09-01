import { Http } from "@angular/http";
import { Component, Inject, OnInit } from "@angular/core";
import "rxjs/add/operator/map";
import { AlertService } from "../../alert/alert.service";

@Component({
    selector: "cde-org-account-management",
    templateUrl: "./orgAccountManagement.component.html",
})
export class OrgAccountManagementComponent {

    constructor(private http: Http,
        private alert: AlertService,
        @Inject("userResource") public userService) {}

    newUsername: string;
    newOrgName: string;
    orgCurators = [];

    getOrgCurators () {
        this.http.get("/orgCurators").map(r => r.json()).subscribe(response => {
            this.orgCurators = response.orgs;
        });
    };

    addOrgCurator () {
        this.http.post('/addOrgCurator', {
            username: this.newUsername
            , org: this.newOrgName
        }).subscribe(() => {
            this.alert.addAlert("success", "Saved");
            this.getOrgCurators();
        }, () => this.alert.addAlert("danger", "There was an issue saving.")
        );
        this.newUsername = "";
        this.newOrgName = "";
    };

}