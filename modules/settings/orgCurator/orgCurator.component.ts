import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

import { AlertService } from 'alert/alert.service';
import { UserService } from '_app/user.service';
import { IsAllowedService } from 'non-core/isAllowed.service';
import { ObjectId } from 'shared/models.model';
import { stringCompare } from 'shared/system/util';

type OrgUsers = { org: string, users: { _id: ObjectId, username: string }[] };

@Component({
    selector: 'cde-org-curator',
    templateUrl: './orgCurator.component.html'
})
export class OrgCuratorComponent {
    orgCurators?: OrgUsers[];
    newUsername!: string;
    newOrgName!: string;

    constructor(private alert: AlertService,
                private http: HttpClient,
                public isAllowedModel: IsAllowedService,
                public userService: UserService) {
        this.getOrgCurators();

    }


    getOrgCurators() {
        this.http.get<OrgUsers[]>('/orgCurators').subscribe(response => {
            this.orgCurators = response.sort((a, b) => stringCompare(a.org, b.org));
        });
    }


    addOrgCurator() {
        this.http.post('/addOrgCurator', {
            username: this.newUsername,
            org: this.newOrgName
        }, {responseType: 'text'}).subscribe(() => {
                this.alert.addAlert('success', 'Saved');
                this.getOrgCurators();
            }, () => this.alert.addAlert('danger', 'There was an issue saving.')
        );
        this.newOrgName = '';
    }


    removeOrgCurator(orgName: string, userId: string) {
        this.http.post('/removeOrgCurator', {
            org: orgName,
            userId: userId
        }, {responseType: 'text'}).subscribe(() => {
            this.alert.addAlert('success', 'Removed');
            this.getOrgCurators();
        }, () => this.alert.addAlert('danger', 'An error occured.'));
    }

}
