import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { UserService } from '_app/user.service';
import { AlertService } from 'alert/alert.service';
import { IsAllowedService } from 'non-core/isAllowed.service';
import { OrgManageAddRequest, OrgManageRemoveRequest } from 'shared/boundaryInterfaces/API/orgManagement';
import { ObjectId } from 'shared/models.model';
import { stringCompare } from 'shared/util';

interface OrgUsers {
    org: string;
    users: {
        _id: ObjectId;
        username: string;
    }[];
}

@Component({
    templateUrl: './orgCurator.component.html',
})
export class OrgCuratorComponent {
    orgCurators?: OrgUsers[];
    newUsername!: string;
    newOrgName!: string;

    isLoadingResults = false;

    constructor(
        private alert: AlertService,
        private http: HttpClient,
        public isAllowedModel: IsAllowedService,
        public userService: UserService
    ) {
        this.getOrgCurators();
    }

    getOrgCurators() {
        this.http.get<OrgUsers[]>('/server/orgManagement/orgCurators').subscribe(response => {
            this.orgCurators = response.sort((a, b) => stringCompare(a.org, b.org));
        });
    }

    addOrgCurator() {
        this.isLoadingResults = true;
        this.http
            .post(
                '/server/orgManagement/addOrgCurator',
                {
                    username: this.newUsername,
                    org: this.newOrgName,
                } as OrgManageAddRequest,
                { responseType: 'text' }
            )
            .subscribe({
                next: () => {
                    this.alert.addAlert('success', 'Saved');
                    this.getOrgCurators();
                },
                error: () => this.alert.addAlert('danger', 'There was an issue saving.'),
                complete: () => {
                    this.isLoadingResults = false;
                },
            });
        this.newOrgName = '';
    }

    removeOrgCurator(orgName: string, userId: string) {
        this.isLoadingResults = true;
        this.http
            .post(
                '/server/orgManagement/removeOrgCurator',
                {
                    org: orgName,
                    userId,
                } as OrgManageRemoveRequest,
                { responseType: 'text' }
            )
            .subscribe({
                next: () => {
                    this.alert.addAlert('success', 'Removed');
                    this.getOrgCurators();
                },
                error: () => this.alert.addAlert('danger', 'An error occured.'),
                complete: () => {
                    this.isLoadingResults = false;
                },
            });
    }
}
