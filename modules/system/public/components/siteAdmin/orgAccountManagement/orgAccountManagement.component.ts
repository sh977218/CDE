import { Http } from "@angular/http";
import { Component, Inject, OnInit } from "@angular/core";
import "rxjs/add/operator/map";
import { AlertService } from "../../alert/alert.service";
import { Observable } from "rxjs/Observable";

@Component({
    selector: "cde-org-account-management",
    templateUrl: "./orgAccountManagement.component.html",
})
export class OrgAccountManagementComponent implements OnInit {

    constructor(private http: Http,
        private alert: AlertService,
        @Inject("userResource") public userService) {}

    newUsername: string;
    newOrgName: string;
    orgCurators = [];
    transferStewardObj = {};

    ngOnInit () {
        this.getOrgCurators();
    }

    getOrgCurators () {
        this.http.get("/orgCurators").map(r => r.json()).subscribe(response => {
            this.orgCurators = response.orgs.sort((a, b) => a.name - b.name);
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

    removeOrgCurator (orgName, userId) {
        this.http.post('/removeOrgCurator', {
            orgName: orgName
            , userId: userId
        }).subscribe(() => {
            this.alert.addAlert("success", "Removed");
            this.getOrgCurators();
        }, () => this.alert.addAlert("danger", "An error occured."));
    };

    // TODO When userService is NGx, move to userService.
    searchTypeahead = (text$: Observable<string>) =>
        text$.debounceTime(300).distinctUntilChanged()
            .switchMap(term => term.length < 3 ? [] :
                this.http.get("/searchUsers/" + term).map(r => r.json()).map(r => r.users.map(u => u.username))
                    .catch(() => Observable.of([]))
            );
    formatter = (result: any) => result.username;

    transferSteward () {
        this.http.post('/transferSteward', this.transferStewardObj).subscribe(() => {
            this.alert.addAlert("success", "Saved");
            this.transferStewardObj = {};
        }, function onError(response) {
            this.alert.addAlert("danger", "An error occured.");
            this.transferStewardObj = {};
        });
    };

}