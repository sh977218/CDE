import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

import { AlertService } from 'alert/alert.service';
import { UserService } from '_app/user.service';

@Component({
    selector: 'cde-edit-site-admins',
    templateUrl: './editSiteAdmins.component.html'
})
export class EditSiteAdminsComponent {
    newAdmin: any;
    siteAdmins: any = [];
    orgAuthorities: any = [];

    constructor(private Alert: AlertService,
                private http: HttpClient,
                public userService: UserService) {
        this.getSiteAdmins();
        this.getOrgAuthorities();
    }

    addSiteAdmin() {
        this.http.post('/server/siteAdmin/addSiteAdmin', {username: this.newAdmin}, {responseType: 'text'}).subscribe(() => {
                this.Alert.addAlert('success', 'Saved');
                this.getSiteAdmins();
            }, () => this.Alert.addAlert('danger', 'There was an issue adding this administrator.')
        );
        this.newAdmin = '';
    }

    getSiteAdmins() {
        this.http.get('/server/siteAdmin/siteAdmins')
            .subscribe(response => this.siteAdmins = response, () => {
            });
    }

    getOrgAuthorities() {
        this.http.get('/server/siteAdmin/orgAuthorities')
            .subscribe(response => this.orgAuthorities = response, () => {
            });
    }

    removeSiteAdmin(name: string) {
        this.http.post('/server/siteAdmin/removeSiteAdmin', {username: name}).subscribe(() => {
                this.Alert.addAlert('success', 'Removed');
                this.getSiteAdmins();
            }, () => {
                this.Alert.addAlert('danger', 'There was an issue removing this administrator.');
            }
        );
    }
}