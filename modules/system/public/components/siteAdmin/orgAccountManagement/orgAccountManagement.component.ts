import { Http } from "@angular/http";
import { Component, OnInit } from "@angular/core";
import "rxjs/add/operator/map";
import { AlertService } from "../../alert/alert.service";
import { Observable } from "rxjs/Observable";
import { UserService } from "../../../../../core/public/user.service";

@Component({
    selector: "cde-org-account-management",
    templateUrl: "./orgAccountManagement.component.html",
})
export class OrgAccountManagementComponent implements OnInit {

    constructor(private http: Http,
        private alert: AlertService,
        public userService: UserService) {}

    newUsername: string;
    newOrgName: string;
    orgCurators = [];
    transferStewardObj = {};

    ngOnInit () {
        this.getOrgCurators();
    }

    getOrgCurators () {
        console.log("HELLO");
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
        this.http.post('/transferSteward', this.transferStewardObj).map(r => r.text()).subscribe(r => {
            this.alert.addAlert("success", r);
            this.transferStewardObj = {};
        }, () => {
            this.alert.addAlert("danger", "An error occured.");
            this.transferStewardObj = {};
        });
    };

}