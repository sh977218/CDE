import { Component, Inject, OnInit } from "@angular/core";
import { Http } from "@angular/http";
import "rxjs/add/operator/map";
import { AlertService } from "../../alert/alert.service";
import { OrgHelperService } from 'core/public/orgHelper.service';

@Component({
    selector: "cde-orgs-edit",
    templateUrl: "orgsEdit.component.html"
})
export class OrgsEditComponent implements OnInit {

    constructor(@Inject("AccountManagement") private AccountManagement,
                private Alert: AlertService,
                private http: Http,
                private orgHelperService: OrgHelperService
    ) {}

    newOrg: any = {};
    orgs: any;
    editWG: any = {};

    getOrgs (cb?) {
        this.http.get("/managedOrgs").map(r => r.json())
            .subscribe(response => {
                this.orgs = response.orgs.sort((a, b) => a.name - b.name);
                if (cb) cb();
            });
    }

    ngOnInit () {
        this.getOrgs();
    }

    addOrg () {
        this.AccountManagement.addOrg(
            {name: this.newOrg.name, longName: this.newOrg.longName, workingGroupOf: this.newOrg.workingGroupOf}
            , res => {
                this.Alert.addAlert("success", res);
                this.getOrgs();
                this.newOrg = {};
            }, () => {
                this.Alert.addAlert("danger", "An error occured.");
            }
        );
    }

    updateOrg (org) {
        this.AccountManagement.updateOrg(org, res => {
            this.orgs = this.getOrgs(() => {
                this.orgHelperService.reload().then(() => this.Alert.addAlert("success", res));
            });
        }, res => this.Alert.addAlert("danger", res)
        );
    }

}