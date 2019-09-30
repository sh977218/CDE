import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { AlertService } from 'alert/alert.service';
import { Cb, Organization } from 'shared/models.model';
import { ActivatedRoute } from '@angular/router';
import { stringCompare } from 'shared/system/util';

@Component({
    selector: 'cde-orgs-edit',
    templateUrl: 'orgsEdit.component.html'
})
export class OrgsEditComponent {
    organizations: Organization[];
    editWG: any = {};
    newOrg: any = {};

    constructor(private alert: AlertService,
                private route: ActivatedRoute,
                private http: HttpClient) {
        this.organizations = this.route.snapshot.data.organizations;
    }

    addOrg() {
        this.http.post('/addOrg', this.newOrg, {responseType: 'text'})
            .subscribe(() => {
                    this.alert.addAlert('success', 'Saved');
                    this.getOrgs();
                    this.newOrg = {};
                }, () => {
                    this.alert.addAlert('danger', 'An error occured.');
                }
            );
    }

    getOrgs(cb?: Cb) {
        this.http.get<Organization[]>('/allOrgs')
            .subscribe(orgs => {
                this.organizations = orgs.sort((a, b) => stringCompare(a.name, b.name));
                if (cb) {
                    cb();
                }
            });
    }

    updateOrg(org: Organization, index) {
        this.http.post<Organization>('/updateOrg', org).subscribe(updatedOrg => {
                this.organizations[index] = updatedOrg;
                this.alert.addAlert('success', 'Saved');
            }, () => this.alert.addAlert('danger', 'There was an issue updating this org.')
        );
    }
}
