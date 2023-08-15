import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '_app/user.service';
import { isSiteAdmin } from 'shared/security/authorizationShared';

@Component({
    selector: 'cde-site-audit',
    templateUrl: './siteAudit.component.html',
})
export class SiteAuditComponent implements OnDestroy, OnInit {
    isAdmin = false;
    tabIndex = 0;
    unsubscribeUser?: () => void;

    constructor(public userService: UserService, private route: ActivatedRoute) {
        this.unsubscribeUser = this.userService.subscribe(user => (this.isAdmin = isSiteAdmin(user || undefined)));
    }

    ngOnInit(): void {
        const tab = this.route.snapshot.queryParams.tab;
        if (tab) {
            if (tab === 'serverErrors') {
                this.tabIndex = 7;
            }
            if (tab === 'clientErrors') {
                this.tabIndex = 8;
            }
        }
    }

    ngOnDestroy() {
        if (this.unsubscribeUser) {
            this.unsubscribeUser();
            this.unsubscribeUser = undefined;
        }
    }
}
