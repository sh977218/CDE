import { Component } from '@angular/core';
import { Http } from '@angular/http';
import { AlertService } from 'system/public/components/alert/alert.service';
import { CdeForm } from 'form/public/form.model';
import { DataElement } from 'cde/public/dataElement.model';
import { User } from 'core/public/models.model';
import * as _ from "lodash";
import { UserService } from 'core/public/user.service';

@Component({
    selector: "cde-profile",
    templateUrl: "profile.component.html"
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
                    if (_.isArray(response)) this.cdes.forEach((elt, i, elts) => elts[i] = Object.assign(new DataElement, elt));
                    else this.cdes = [];
                }, err => this.alert.addAlert("danger", "Error, unable to retrieve data element view history. " + err)
            );
        this.http.get('/viewingHistory/form').map(res => res.json())
            .subscribe(
                response => {
                    this.forms = response;
                    if (_.isArray(response)) this.forms.forEach((elt, i, elts) => elts[i] = Object.assign(new CdeForm, elt));
                    else this.forms = [];
                }, err => this.alert.addAlert("danger", "Error, unable to retrieve form view history. " + err)
            );
        this.reloadUser();
    }

    saveProfile() {
        this.http.post("/user/me", this.user)
            .subscribe(
                () => {
                    this.reloadUser();
                    this.alert.addAlert("success", "Saved");
                },
                err => this.alert.addAlert("danger", "Error, unable to save")
            );
    }

    reloadUser() {
        this.userService.then(() => {
            if (this.userService.user.username) {
                this.hasQuota = this.userService.user.quota;
                this.orgCurator = this.userService.user.orgCurator.toString().replace(/,/g, ", ");
                this.orgAdmin = this.userService.user.orgAdmin.toString().replace(/,/g, ", ");
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
