import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

import { AlertService } from '_app/alert.service';
import { OrgHelperService } from 'core/orgHelper.service';
import { Organization } from 'shared/models.model';

@Component({
    selector: 'cde-list-management',
    templateUrl: './listManagement.component.html'
})
export class ListManagementComponent implements OnInit {
    orgs?: any[];
    allPropertyKeys: String[] = [];
    allTags: String[] = [];

    ngOnInit() {
        this.getOrgs();
    }

    constructor(private http: HttpClient,
                private Alert: AlertService,
                private orgHelperService: OrgHelperService) {
    }

    getOrgs() {
        this.http.get<Organization[]>('/managedOrgs').subscribe(orgs => {
            this.orgs = orgs;
            this.orgs.forEach(o => {
                if (o.propertyKeys) {
                    this.allPropertyKeys = this.allPropertyKeys.concat(o.propertyKeys);
                }
                if (o.nameTags) {
                    this.allTags = this.allTags.concat(o.nameTags);
                }
            });
            this.orgs.sort((a, b) => a.name - b.name);
            this.allPropertyKeys = this.allPropertyKeys.filter((item, pos, self) => self.indexOf(item) === pos);
            this.allTags = this.allTags.filter((item, pos, self) => self.indexOf(item) === pos);
        });
    }

    saveOrg(org: Organization) {
        this.http.post('/updateOrg', org)
            .subscribe(() => this.orgHelperService.reload().then(() => this.Alert.addAlert('success', 'Org Updated')),
                () => this.Alert.addAlert('danger', 'Error. Unable to save.'));
    }
}
