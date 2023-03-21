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

    constructor(
        private alert: AlertService,
        private http: HttpClient,
        public isAllowedModel: IsAllowedService,
        public userService: UserService
    ) {
        this.getAdmins();
    }

    addOrgAdmin() {
        this.http
            .post(
                '/server/orgManagement/addOrgAdmin',
                {
                    username: this.newAdmin.username,
                    org: this.newAdmin.orgName,
                } as OrgManageAddRequest,
                { responseType: 'text' }
            )
            .subscribe(
                () => {
                    this.alert.addAlert('success', 'Saved');
                    this.getAdmins();
                },
                () => this.alert.addAlert('danger', 'There was an issue adding this administrator.')
            );
    }

    getAdmins() {
        if (this.isAllowedModel.hasRole('OrgAuthority')) {
            return this.http.get<UsersOrgQuery[]>('/server/orgManagement/orgAdmins').subscribe(r => this.setOrgs(r));
        } else {
            return this.http.get<UsersOrgQuery[]>('/server/orgManagement/myOrgsAdmins').subscribe(r => this.setOrgs(r));
        }
    }

    removeOrgAdmin(orgName: string, userId: string) {
        this.http
            .post(
                '/server/orgManagement/removeOrgAdmin',
                {
                    org: orgName,
                    userId,
                } as OrgManageRemoveRequest,
                { responseType: 'text' }
            )
            .subscribe(
                () => {
                    this.alert.addAlert('success', 'Removed');
                    this.getAdmins();
                },
                () => this.alert.addAlert('danger', 'An error occurred.')
            );
    }

    setOrgs(r: UsersOrgQuery[]) {
        this.orgAdmins = r;
        if (this.orgAdmins && this.orgAdmins.length === 1) {
            this.newAdmin.orgName = this.orgAdmins[0].name;
        }
    }
}
