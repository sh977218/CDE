import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertService } from 'alert/alert.service';
import { Organization } from 'shared/organization/organization';
import { tap } from 'rxjs/operators';

@Component({
    templateUrl: './propertiesManagement.component.html',
})
export class PropertiesManagementComponent {
    allPropertyKeys: string[] = [];
    orgs: any[];
    isLoadingResults = false;

    constructor(private http: HttpClient, private alert: AlertService, private route: ActivatedRoute) {
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
        this.isLoadingResults = true;
        this.http
            .post('/server/orgManagement/updateOrg', org)
            .pipe(
                tap({
                    next: () => this.alert.addAlert('success', 'Org Updated'),
                    error: () => this.alert.addAlert('danger', 'Error. Unable to save.'),
                    complete: () => (this.isLoadingResults = false),
                })
            )
            .subscribe();
    }
}
