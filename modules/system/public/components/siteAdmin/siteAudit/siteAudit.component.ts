import { Component, OnInit } from '@angular/core';
import _noop from 'lodash/noop';

import { UserService } from '_app/user.service';
import { isSiteAdmin } from 'shared/system/authorizationShared';
import { ActivatedRoute } from "@angular/router";

@Component({
    selector: 'cde-site-audit',
    templateUrl: './siteAudit.component.html'
})
export class SiteAuditComponent implements OnInit {
    isAdmin = false;

    constructor(public userService: UserService,
                private route: ActivatedRoute) {
        this.userService.then(user => this.isAdmin = isSiteAdmin(user), _noop);
    }

    ngOnInit () {
        if (this.route.snapshot.queryParams['triggerClientError']) {
            throw new Error("An exception has been thown");
        }
    }

}
