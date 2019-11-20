import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatTab } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '_app/user.service';
import _noop from 'lodash/noop';
import { isSiteAdmin } from 'shared/system/authorizationShared';

@Component({
    selector: 'cde-site-audit',
    templateUrl: './siteAudit.component.html'
})
export class SiteAuditComponent implements OnInit {
    @ViewChild('serverErrorTab', {static: true}) serverErrorTab!: MatTab;
    @ViewChild('clientErrorTab', {static: true}) clientErrorTab!: MatTab;
    isAdmin = false;
    selectedTab = new FormControl(0);

    constructor(public userService: UserService,
                private route: ActivatedRoute) {
        this.userService.then(user => this.isAdmin = isSiteAdmin(user), _noop);
    }

    ngOnInit() {
        setTimeout(() => {
            if (this.route.snapshot.queryParams.tab) {
                const tab = this.route.snapshot.queryParams.tab;
                if (tab === 'serverErrors') {
                    this.selectedTab.setValue(this.serverErrorTab.position);
                }
                if (tab === 'clientErrors') {
                    this.selectedTab.setValue(this.clientErrorTab.position);
                }
            }
        }, 0);
    }
}
