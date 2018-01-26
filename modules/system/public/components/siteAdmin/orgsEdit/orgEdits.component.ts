import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

import { AlertService } from '_app/alert/alert.service';
import { OrgHelperService } from 'core/orgHelper.service';


@Component({
    selector: 'cde-orgs-edit',
    templateUrl: 'orgsEdit.component.html'
})
export class OrgsEditComponent implements OnInit {
    editWG: any = {};
    newOrg: any = {};
    orgs: any;

    ngOnInit () {
        this.getOrgs();
    }

    constructor(
        private Alert: AlertService,
        private http: HttpClient,
        private orgHelperService: OrgHelperService
    ) {}

    addOrg () {
        this.http.post('/addOrg',
            {name: this.newOrg.name, longName: this.newOrg.longName, workingGroupOf: this.newOrg.workingGroupOf})
            .subscribe(res => {
                    this.Alert.addAlert('success', 'Saved');
                    this.getOrgs();
                    this.newOrg = {};
                }, () => {
                    this.Alert.addAlert('danger', 'An error occured.');
                }
            );
    }

    getOrgs (cb?) {
        this.http.get<any>('/managedOrgs')
            .subscribe(response => {
                this.orgs = response.orgs.sort((a, b) => a.name - b.name);
                if (cb) cb();
            });
    }

    updateOrg (org) {
        this.http.post('/updateOrg', org).subscribe(res => {
            this.orgs = this.getOrgs(() => {
                this.orgHelperService.reload().then(() => this.Alert.addAlert('success', 'Saved'));
            });
        }, res => this.Alert.addAlert('danger', 'There was an issue updating this org.')
        );
    }
}
