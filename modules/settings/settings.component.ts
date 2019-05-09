import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { isOrgAdmin, isOrgAuthority, isOrgCurator } from 'shared/system/authorizationShared';

@Component({
    templateUrl: './settings.component.html',
    styles: [`
        mat-list-item {
            cursor: pointer;
        }

        mat-list-item:hover {
            border: solid lightgray;
            background-color: lightgray;
        }

        ul {
            list-style: none;
        }

        .is-active {
            background-color: #c4d2e7;
        }

        .settingsContent {
            border-width: 0 0 1px 1px;
            border-style: solid
        }
    `]
})
export class SettingsComponent {
    documentationEditor: boolean;
    orgAdmin: boolean;
    orgAuthority: boolean;
    orgCurator: boolean;
    siteAdmin: boolean;

    constructor(private route: ActivatedRoute) {
        let user = this.route.snapshot.data.user;

        if (user.siteAdmin) {
            this.siteAdmin = true;
            this.documentationEditor = true;
        }
        if (user.roles.indexOf("DocumentationEditor") > -1) this.documentationEditor = true;
        if (isOrgAdmin(user)) this.orgAdmin = true;
        if (isOrgAuthority(user)) this.orgAuthority = true;
        if (isOrgCurator(user)) this.orgCurator = true;
    }
}