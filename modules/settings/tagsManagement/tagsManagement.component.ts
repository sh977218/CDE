import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertService } from 'alert/alert.service';
import { OrgHelperService } from 'non-core/orgHelper.service';
import { Organization } from 'shared/models.model';

@Component({
    templateUrl: './tagsManagement.component.html'
})
export class TagsManagementComponent {
    allTags: string[] = [];
    orgs: any[];

    constructor(private http: HttpClient,
                private alert: AlertService,
                private route: ActivatedRoute) {

        this.orgs = this.route.snapshot.data.managedOrgs;
        this.orgs.forEach(o => {
            if (o.nameTags) {
                this.allTags = this.allTags.concat(o.nameTags);
            }
        });
        this.orgs.sort((a, b) => a.name - b.name);
        this.allTags = this.allTags.filter((item, pos, self) => self.indexOf(item) === pos);
    }

    saveOrg(org: Organization, index) {
        this.http.post<Organization>('/updateOrg', org).subscribe(
            updatedOrg => {
                this.orgs[index] = updatedOrg;
                this.alert.addAlert('success', 'Org Updated');
            },
            () => this.alert.addAlert('danger', 'Error. Unable to save.')
        );
    }
}
