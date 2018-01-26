import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';

import { AlertService } from '_app/alert/alert.service';
import { UserService } from '_app/user.service';


@Component({
    selector: 'cde-org-account-management',
    templateUrl: './orgAccountManagement.component.html',
})
export class OrgAccountManagementComponent implements OnInit {
    newUsername: string;
    newOrgName: string;
    orgCurators = [];
    transferStewardObj = {};

    ngOnInit () {
        this.getOrgCurators();
    }

    constructor(
        private http: HttpClient,
        private alert: AlertService,
        public userService: UserService
    ) {}

    addOrgCurator () {
        this.http.post('/addOrgCurator', {
            username: this.newUsername
            , org: this.newOrgName
        }).subscribe(() => {
            this.alert.addAlert('success', 'Saved');
            this.getOrgCurators();
        }, () => this.alert.addAlert('danger', 'There was an issue saving.')
        );
        this.newUsername = '';
        this.newOrgName = '';
    }

    getOrgCurators () {
        this.http.get<any>('/orgCurators').subscribe(response => {
            this.orgCurators = response.orgs.sort((a, b) => a.name - b.name);
        });
    }

    removeOrgCurator (orgName, userId) {
        this.http.post('/removeOrgCurator', {
            orgName: orgName
            , userId: userId
        }).subscribe(() => {
            this.alert.addAlert('success', 'Removed');
            this.getOrgCurators();
        }, () => this.alert.addAlert('danger', 'An error occured.'));
    }

    transferSteward () {
        this.http.post<string>('/transferSteward', this.transferStewardObj).subscribe(r => {
            this.alert.addAlert('success', r);
            this.transferStewardObj = {};
        }, () => {
            this.alert.addAlert('danger', 'An error occured.');
            this.transferStewardObj = {};
        });
    }
}
