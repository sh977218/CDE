import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { AlertService } from 'alert/alert.service';
import { UserService } from '_app/user.service';
import { ObjectId } from 'shared/models.model';
import { stringCompare } from 'shared/system/util';

type OrgUsers = { org: string, users: { _id: ObjectId, username: string }[] };

@Component({
    selector: 'cde-org-account-management',
    templateUrl: './orgAccountManagement.component.html',
})
export class OrgAccountManagementComponent {
    newUsername!: string;
    newOrgName!: string;
    orgCurators?: OrgUsers[];
    transferStewardObj = {};

    constructor(private http: HttpClient,
                private alert: AlertService,
                public userService: UserService) {
        this.getOrgCurators();
    }

    addOrgCurator() {
        this.http.post('/addOrgCurator', {
            username: this.newUsername,
            org: this.newOrgName
        }, {responseType: 'text'}).subscribe(() => {
                this.alert.addAlert('success', 'Saved');
                this.getOrgCurators();
            }, () => this.alert.addAlert('danger', 'There was an issue saving.')
        );
        this.newUsername = '';
        this.newOrgName = '';
    }

    getOrgCurators() {
        this.http.get<OrgUsers[]>('/orgCurators').subscribe(response => {
            this.orgCurators = response.sort((a, b) => stringCompare(a.org, b.org));
        });
    }

    removeOrgCurator(orgName: string, userId: string) {
        this.http.post('/removeOrgCurator', {
            org: orgName,
            userId: userId
        }, {responseType: 'text'}).subscribe(() => {
            this.alert.addAlert('success', 'Removed');
            this.getOrgCurators();
        }, () => this.alert.addAlert('danger', 'An error occured.'));
    }

    transferSteward() {
        this.http.post('/transferSteward', this.transferStewardObj, {responseType: 'text'}).subscribe(r => {
            this.alert.addAlert('success', r);
            this.transferStewardObj = {};
        }, () => {
            this.alert.addAlert('danger', 'An error occurred.');
            this.transferStewardObj = {};
        });
    }
}
