import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

import { AlertService } from '_app/alert/alert.service';
import { UserService } from '_app/user.service';


@Component({
    selector: 'cde-edit-site-admins',
    templateUrl: './editSiteAdmins.component.html'
})
export class EditSiteAdminsComponent implements OnInit {
    newAdmin: any;
    siteAdmins: any = [];

    ngOnInit() {
        this.getSiteAdmins();
    }

    constructor(
        private Alert: AlertService,
        private http: HttpClient,
        public userService: UserService,
    ) {}

    addSiteAdmin() {
        this.http.post('/addSiteAdmin', {username: this.newAdmin.username}, {responseType: 'text'}).subscribe(() => {
            this.Alert.addAlert('success', 'Saved');
            this.getSiteAdmins();
        }, () => this.Alert.addAlert('danger', 'There was an issue adding this administrator.')
        );
        this.newAdmin.username = '';
    };

    getSiteAdmins() {
        this.http.get('/siteAdmins').subscribe(response => this.siteAdmins = response);
    }

    removeSiteAdmin(byId) {
        this.http.post('/removeSiteAdmin', {id: byId}).subscribe(() => {
                this.Alert.addAlert('success', 'Removed');
                this.getSiteAdmins();
            }, () => {
                this.Alert.addAlert('danger', 'There was an issue removing this administrator.');
            }
        );
    }
}
