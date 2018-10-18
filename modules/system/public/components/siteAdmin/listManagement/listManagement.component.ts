import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { AlertService } from 'alert/alert.service';
import { OrgHelperService } from 'core/orgHelper.service';
import { Organization } from 'shared/models.model';

@Component({
    selector: 'cde-list-management',
    templateUrl: './listManagement.component.html'
})
export class ListManagementComponent {
    orgs?: any[];
    allPropertyKeys: string[] = [];
    allTags: string[] = [];

    constructor(private http: HttpClient,
                private Alert: AlertService,
                private orgHelperService: OrgHelperService) {
        this.getOrgs();

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
