import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

import { AlertService } from 'alert/alert.service';
import { OrgHelperService } from 'non-core/orgHelper.service';
import { Cb, Organization } from 'shared/models.model';
import { stringCompare } from 'shared/system/util';


@Component({
    selector: 'cde-orgs-edit',
    templateUrl: 'orgsEdit.component.html'
})
export class OrgsEditComponent implements OnInit {
    editWG: any = {};
    newOrg: any = {};
    orgs?: Organization[];

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
            {name: this.newOrg.name, longName: this.newOrg.longName, workingGroupOf: this.newOrg.workingGroupOf},
            {responseType: 'text'})
            .subscribe(() => {
                    this.Alert.addAlert('success', 'Saved');
                    this.getOrgs();
                    this.newOrg = {};
                }, () => {
                    this.Alert.addAlert('danger', 'An error occured.');
                }
            );
    }

    getOrgs (cb?: Cb) {
        this.http.get<Organization[]>('/managedOrgs')
            .subscribe(orgs => {
                this.orgs = orgs.sort((a, b) => stringCompare(a.name, b.name));
                if (cb) cb();
            });
    }

    updateOrg (org: Organization) {
        this.http.post('/updateOrg', org).subscribe(res => {
            this.getOrgs(() => {
                this.orgHelperService.reload().then(() => this.Alert.addAlert('success', 'Saved'));
            });
        }, () => this.Alert.addAlert('danger', 'There was an issue updating this org.')
        );
    }
}
