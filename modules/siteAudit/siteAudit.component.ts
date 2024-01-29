import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '_app/user.service';
import { isSiteAdmin } from 'shared/security/authorizationShared';
import { MatTabsModule } from '@angular/material/tabs';
import { NgIf } from '@angular/common';
import { HttpLogComponent } from './http-log/http-log.component';
import { AppLogComponent } from './app-log/app-log.component';
import { DailyUsageComponent } from './daily-usage/daily-usage.component';
import { ItemLogComponent } from './item-log/item-log.component';
import { ActiveBanComponent } from './active-ban/active-ban.component';
import { ServerErrorComponent } from './server-error/server-error.component';
import { ClientErrorComponent } from './client-error/client-error.component';
import { LoginRecordComponent } from './login-record/login-record.component';

@Component({
    selector: 'cde-site-audit',
    templateUrl: './siteAudit.component.html',
    imports: [
        NgIf,
        MatTabsModule,
        AppLogComponent,
        HttpLogComponent,
        DailyUsageComponent,
        LoginRecordComponent,
        ItemLogComponent,
        ActiveBanComponent,
        ServerErrorComponent,
        ClientErrorComponent,
        LoginRecordComponent,
    ],
    standalone: true,
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
