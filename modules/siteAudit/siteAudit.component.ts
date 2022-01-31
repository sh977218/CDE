import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatTab } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '_app/user.service';
import { isSiteAdmin } from 'shared/security/authorizationShared';
import { noop } from 'shared/util';

@Component({
    selector: 'cde-site-audit',
    templateUrl: './siteAudit.component.html'
})
export class SiteAuditComponent implements OnInit {
    @ViewChild('serverErrorTab') serverErrorTab!: MatTab;
    @ViewChild('clientErrorTab') clientErrorTab!: MatTab;
    isAdmin = false;
    selectedTab = new FormControl(0);

    constructor(public userService: UserService,
                private route: ActivatedRoute) {
        this.userService.then(user => {
            this.isAdmin = isSiteAdmin(user);
        }, noop);
    }

    ngOnInit() {
        setTimeout(() => {
            try {
                if (this.route.snapshot.queryParams.tab) {
                    const tab = this.route.snapshot.queryParams.tab;
                    if (tab === 'serverErrors') {
                        this.selectedTab.setValue(this.serverErrorTab.position);
                    }
                    if (tab === 'clientErrors') {
                        this.selectedTab.setValue(this.clientErrorTab.position);
                    }
                }
            } catch (e) {
            }
        }, 0);
    }
}
