import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { UserService } from '_app/user.service';
import { AlertService } from 'alert/alert.service';

@Component({
    selector: 'cde-edit-site-admins',
    templateUrl: './editSiteAdmins.component.html',
})
export class EditSiteAdminsComponent {
    newAdmin: any;
    siteAdmins: any = [];
    orgAuthorities: any = [];

    constructor(private alert: AlertService, private http: HttpClient, public userService: UserService) {
        this.getSiteAdmins();
        this.getOrgAuthorities();
    }

    addSiteAdmin() {
        this.http
            .post('/server/siteAdmin/addSiteAdmin', { username: this.newAdmin }, { responseType: 'text' })
            .subscribe(
                () => {
                    this.alert.addAlert('success', 'Saved');
                    this.getSiteAdmins();
                },
                () => this.alert.addAlert('danger', 'There was an issue adding this administrator.')
            );
        this.newAdmin = '';
    }

    getSiteAdmins() {
        this.http.get('/server/siteAdmin/siteAdmins').subscribe(
            response => (this.siteAdmins = response),
            () => {}
        );
    }

    getOrgAuthorities() {
        this.http.get('/server/siteAdmin/orgAuthorities').subscribe(
            response => (this.orgAuthorities = response),
            () => {}
        );
    }

    removeSiteAdmin(name: string) {
        this.http.post('/server/siteAdmin/removeSiteAdmin', { username: name }).subscribe(
            () => {
                this.alert.addAlert('success', 'Removed');
                this.getSiteAdmins();
            },
            () => {
                this.alert.addAlert('danger', 'There was an issue removing this administrator.');
            }
        );
    }
}
