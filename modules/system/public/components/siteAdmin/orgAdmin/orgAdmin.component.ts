import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

import { AlertService } from '_app/alert/alert.service';
import { UserService } from '_app/user.service';
import { IsAllowedService } from 'core/isAllowed.service';


@Component({
    selector: 'cde-org-admin',
    templateUrl: './orgAdmin.component.html'
})
export class OrgAdminComponent implements OnInit {
    newAdmin: any = {orgName: '', username: ''};
    orgAdmins: any[] = [{name: 'Loading...'}];

    ngOnInit() {
        this.getAdmins();
    }

    constructor(
        private alert: AlertService,
        private http: HttpClient,
        public isAllowedModel: IsAllowedService,
        public userService: UserService,
    ) {}

    addOrgAdmin () {
        this.http.post('/addOrgAdmin', {
            username: this.newAdmin.username
            , org: this.newAdmin.orgName
        }).subscribe(() => {
            this.alert.addAlert('success', 'Saved');
            this.getAdmins();
        }, () => this.alert.addAlert('danger', 'There was an issue adding this administrator.'));
        this.newAdmin.username = '';
    }

    getAdmins () {
        if (this.isAllowedModel.hasRole('OrgAuthority')) {
            return this.http.get('/orgAdmins').subscribe(r => this.setOrgs(r));
        } else {
            return this.http.get('/myOrgsAdmins').subscribe(r => this.setOrgs(r));
        }
    }

    removeOrgAdmin (orgName, userId) {
        this.http.post('/removeOrgAdmin', {
            orgName: orgName
            , userId: userId
        }).subscribe(() => {
            this.alert.addAlert('success', 'Removed');
            this.getAdmins();
        }, () => this.alert.addAlert('danger', 'An error occured.'));
    }

    setOrgs (r) {
        this.orgAdmins = r.orgs;
        if (this.orgAdmins && this.orgAdmins.length === 1) this.newAdmin.orgName = this.orgAdmins[0].name;
    }
}
