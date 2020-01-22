import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AlertService } from 'alert/alert.service';
import _noop from 'lodash/noop';
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

    ngOnInit() {
        this.getOrgs();
    }

    constructor(
        private alert: AlertService,
        private http: HttpClient,
        private orgHelperService: OrgHelperService
    ) {
    }

    addOrg() {
        this.http.post('/server/orgManagement/addOrg',
            {name: this.newOrg.name, longName: this.newOrg.longName, workingGroupOf: this.newOrg.workingGroupOf},
            {responseType: 'text'})
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
        this.http.get<Organization[]>('/server/orgManagement/managedOrgs')
            .subscribe(orgs => {
                this.orgs = orgs.sort((a, b) => stringCompare(a.name, b.name));
                if (cb) {
                    cb();
                }
            });
    }

    updateOrg(org: Organization) {
        this.http.post('/server/orgManagement/updateOrg', org).subscribe(res => {
                this.getOrgs(() => {
                    this.orgHelperService.reload().then(() => this.alert.addAlert('success', 'Saved'), _noop);
                });
            }, () => this.alert.addAlert('danger', 'There was an issue updating this org.')
        );
    }
}
