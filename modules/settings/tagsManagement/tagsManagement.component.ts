import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertService } from 'alert/alert.service';
import { Organization } from 'shared/organization/organization';
import { tap } from 'rxjs/operators';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
    templateUrl: './tagsManagement.component.html',
    animations: [
        trigger('detailExpand', [
            state('collapsed', style({ height: '0px', minHeight: '0' })),
            state('expanded', style({ height: '*' })),
            transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ]),
    ],
})
export class TagsManagementComponent {
    allTags: string[] = [];
    orgs: any[];
    isLoadingResults = false;

    constructor(private http: HttpClient, private alert: AlertService, private route: ActivatedRoute) {
        this.orgs = this.route.snapshot.data.managedOrgs;
        this.orgs.forEach(o => {
            if (o.nameTags) {
                this.allTags = this.allTags.concat(o.nameTags);
            }
        });
        this.orgs.sort((a, b) => a.name - b.name);
        this.allTags = this.allTags.filter((item, pos, self) => self.indexOf(item) === pos);
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
