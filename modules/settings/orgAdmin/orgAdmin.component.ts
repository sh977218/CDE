import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { UserService } from '_app/user.service';
import { AlertService } from 'alert/alert.service';
import { IsAllowedService } from 'non-core/isAllowed.service';
import { OrgManageAddRequest, OrgManageRemoveRequest } from 'shared/boundaryInterfaces/API/orgManagement';
import { UsersOrgQuery } from 'shared/models.model';

@Component({
    templateUrl: './orgAdmin.component.html',
})
export class OrgAdminComponent {
    newAdmin: { orgName: string; username: string } = {
        orgName: '',
        username: '',
    };
    orgAdmins: UsersOrgQuery[] = [{ name: 'Loading...' }];

    isLoadingResults = false;

    constructor(
        private alert: AlertService,
        private http: HttpClient,
        public isAllowedModel: IsAllowedService,
        public userService: UserService
    ) {
        this.getAdmins();
    }

    addOrgAdmin() {
        this.isLoadingResults = true;
        this.http
            .post(
                '/server/orgManagement/addOrgAdmin',
                {
                    username: this.newAdmin.username,
                    org: this.newAdmin.orgName,
                } as OrgManageAddRequest,
                { responseType: 'text' }
            )
            .subscribe({
                next: () => {
                    this.alert.addAlert('success', 'Saved');
                    this.getAdmins();
                },
                error: () => this.alert.addAlert('danger', 'There was an issue adding this administrator.'),
                complete: () => {
                    this.isLoadingResults = false;
                },
            });
    }

    getAdmins() {
        let orgUrl = '/server/orgManagement/myOrgsAdmins';
        if (this.isAllowedModel.hasRole('OrgAuthority')) {
            orgUrl = '/server/orgManagement/orgAdmins';
        }
        this.http.get<UsersOrgQuery[]>(orgUrl).subscribe({
            next: (r: UsersOrgQuery[]) => {
                this.setOrgs(r);
            },
        });
    }

    removeOrgAdmin(orgName: string, userId: string) {
        this.isLoadingResults = true;
        this.http
            .post(
                '/server/orgManagement/removeOrgAdmin',
                {
                    org: orgName,
                    userId,
                } as OrgManageRemoveRequest,
                { responseType: 'text' }
            )
            .subscribe({
                next: () => {
                    this.alert.addAlert('success', 'Removed');
                    this.getAdmins();
                },
                error: () => this.alert.addAlert('danger', 'An error occurred.'),
                complete: () => {
                    this.isLoadingResults = false;
                },
            });
    }

    setOrgs(r: UsersOrgQuery[]) {
        this.orgAdmins = r;
        if (this.orgAdmins && this.orgAdmins.length === 1) {
            this.newAdmin.orgName = this.orgAdmins[0].name;
        }
    }
}
