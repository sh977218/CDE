import { Component, OnInit } from "@angular/core";
import { Http } from "@angular/http";
import "rxjs/add/operator/map";
import { OrgHelperService } from 'core/public/orgHelper.service';
import { AlertService } from '_app/alert/alert.service';

@Component({
    selector: "cde-orgs-edit",
    templateUrl: "orgsEdit.component.html"
})
export class OrgsEditComponent implements OnInit {

    constructor(private Alert: AlertService,
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
        this.http.post('/addOrg',
            {name: this.newOrg.name, longName: this.newOrg.longName, workingGroupOf: this.newOrg.workingGroupOf})
            .subscribe(res => {
                this.Alert.addAlert("success", "Saved");
                this.getOrgs();
                this.newOrg = {};
            }, () => {
                this.Alert.addAlert("danger", "An error occured.");
            }
        );
    }

    updateOrg (org) {
        this.http.post('/updateOrg', org).subscribe(res => {
            this.orgs = this.getOrgs(() => {
                this.orgHelperService.reload().then(() => this.Alert.addAlert("success", "Saved"));
            });
        }, res => this.Alert.addAlert("danger", "There was an issue updating this org.")
        );
    }

}