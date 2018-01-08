import { Component } from '@angular/core';
import { Http } from '@angular/http';
import { CdeForm } from 'core/form.model';
import { DataElement } from 'core/dataElement.model';
import { User } from 'core/models.model';
import _isArray from 'lodash/isArray';

import { UserService } from '_app/user.service';
import { AlertService } from '_app/alert/alert.service';


@Component({
    selector: 'cde-profile',
    templateUrl: 'profile.component.html'
})
export class ProfileComponent {
    cdes: any = [];
    forms: any = [];
    hasQuota: any;
    orgCurator: string;
    orgAdmin: string;
    user: User;

    constructor(private http: Http,
                private alert: AlertService,
                private userService: UserService) {

        this.http.get('/viewingHistory/dataElement').map(res => res.json())
            .subscribe(
                response => {
                    this.cdes = response;
                    if (_isArray(response)) this.cdes.forEach((elt, i, elts) => elts[i] = DataElement.copy(elt));
                    else this.cdes = [];
                }, err => this.alert.addAlert('danger', 'Error, unable to retrieve data element view history. ' + err)
            );
        this.http.get('/viewingHistory/form').map(res => res.json())
            .subscribe(
                response => {
                    this.forms = response;
                    if (_isArray(response)) this.forms.forEach((elt, i, elts) => elts[i] = CdeForm.copy(elt));
                    else this.forms = [];
                }, err => this.alert.addAlert('danger', 'Error, unable to retrieve form view history. ' + err)
            );
        this.reloadUser();
    }

    saveProfile() {
        this.http.post('/user/me', this.user)
            .subscribe(
                () => {
                    this.reloadUser();
                    this.alert.addAlert('success', 'Saved');
                },
                err => this.alert.addAlert('danger', 'Error, unable to save')
            );
    }

    reloadUser() {
        this.userService.then(() => {
            if (this.userService.user.username) {
                this.hasQuota = this.userService.user.quota;
                this.orgCurator = this.userService.user.orgCurator.toString().replace(/,/g, ', ');
                this.orgAdmin = this.userService.user.orgAdmin.toString().replace(/,/g, ', ');
                this.user = this.userService.user;
            }
        });
    }

    removePublishedForm(pf) {
        this.user.publishedForms = this.user.publishedForms.filter(function (p: any) {
            return p._id !== pf._id;
        });
        this.saveProfile();
    }
}
