import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { UserService } from '_app/user.service';
import { AlertService } from 'alert/alert.service';
import { IsAllowedService } from 'non-core/isAllowed.service';
import { ObjectId } from 'shared/models.model';
import { stringCompare } from 'shared/system/util';

interface OrgUsers {
    org: string;
    users: {
        _id: ObjectId,
        username: string,
    }[];
}

@Component({
    templateUrl: './orgEditor.component.html'
})
export class OrgEditorComponent {
    orgEditors?: OrgUsers[];
    newUsername!: string;
    newOrgName!: string;

    constructor(private alert: AlertService,
                private http: HttpClient,
                public isAllowedModel: IsAllowedService,
                public userService: UserService) {
        this.getOrgEditors();

    }

    getOrgEditors() {
        this.http.get<OrgUsers[]>('/server/orgManagement/orgEditors').subscribe(response => {
            this.orgEditors = response.sort((a, b) => stringCompare(a.org, b.org));
        });
    }

    addOrgEditor() {
        this.http.post('/server/orgManagement/addOrgEditor', {
            username: this.newUsername,
            org: this.newOrgName
        }, {responseType: 'text'}).subscribe(() => {
                this.alert.addAlert('success', 'Saved');
                this.getOrgEditors();
            }, () => this.alert.addAlert('danger', 'There was an issue saving.')
        );
        this.newOrgName = '';
    }

    removeOrgEditor(orgName: string, userId: string) {
        this.http.post('/server/orgManagement/removeOrgEditor', {
            org: orgName,
            userId
        }, {responseType: 'text'}).subscribe(() => {
            this.alert.addAlert('success', 'Removed');
            this.getOrgEditors();
        }, () => this.alert.addAlert('danger', 'An error occured.'));
    }
}
