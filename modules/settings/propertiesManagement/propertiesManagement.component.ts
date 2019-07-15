import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { AlertService } from 'alert/alert.service';
import { OrgHelperService } from 'non-core/orgHelper.service';
import { Organization } from 'shared/models.model';
import { ActivatedRoute } from '@angular/router';

@Component({
    templateUrl: './propertiesManagement.component.html'
})
export class PropertiesManagementComponent {
    allPropertyKeys: string[] = [];
    orgs: any[];

    constructor(private http: HttpClient,
                private Alert: AlertService,
                private route: ActivatedRoute,
                private orgHelperService: OrgHelperService) {

        this.orgs = this.route.snapshot.data.managedOrgs;
        this.orgs.forEach(o => {
            if (o.propertyKeys) {
                this.allPropertyKeys = this.allPropertyKeys.concat(o.propertyKeys);
            }
        });
        this.orgs.sort((a, b) => a.name - b.name);
        this.allPropertyKeys = this.allPropertyKeys.filter((item, pos, self) => self.indexOf(item) === pos);
    }

    saveOrg(org: Organization) {
        this.http.post('/updateOrg', org).subscribe(
            () => this.orgHelperService.reload().then(() => this.Alert.addAlert('success', 'Org Updated')),
            () => this.Alert.addAlert('danger', 'Error. Unable to save.')
        );
    }
}
