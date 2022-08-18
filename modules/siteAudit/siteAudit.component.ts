import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { UserService } from '_app/user.service';
import { isSiteAdmin } from 'shared/security/authorizationShared';
import { noop } from 'shared/util';
import { map } from 'rxjs/operators';

@Component({
    selector: 'cde-site-audit',
    templateUrl: './siteAudit.component.html',
})
export class SiteAuditComponent implements OnInit {
    isAdmin = false;
    tabIndex = 0;

    constructor(
        public userService: UserService,
        private route: ActivatedRoute
    ) {
        this.userService.then(user => (this.isAdmin = isSiteAdmin(user)), noop);
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
}
