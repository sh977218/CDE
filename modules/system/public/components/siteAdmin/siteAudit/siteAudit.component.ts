import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import _noop from 'lodash/noop';
import { NgbTabset } from '@ng-bootstrap/ng-bootstrap';

import { UserService } from '_app/user.service';
import { isSiteAdmin } from 'shared/system/authorizationShared';

@Component({
    selector: 'cde-site-audit',
    templateUrl: './siteAudit.component.html'
})
export class SiteAuditComponent implements OnInit {
    isAdmin = false;
    @ViewChild('tabs') private tabs: NgbTabset;

    constructor(public userService: UserService,
                private route: ActivatedRoute) {
        this.userService.then(user => this.isAdmin = isSiteAdmin(user), _noop);
    }

    ngOnInit() {
        if (this.route.snapshot.queryParams['triggerClientError']) {
            throw new Error("An exception has been thown");
        }
    }

}
