import { Component, OnInit, AfterViewChecked, ViewChild } from '@angular/core';
import _noop from 'lodash/noop';
import { ActivatedRoute } from "@angular/router";
import { NgbTabset } from '@ng-bootstrap/ng-bootstrap';

import { UserService } from '_app/user.service';
import { isSiteAdmin } from 'shared/system/authorizationShared';

@Component({
    selector: 'cde-site-audit',
    templateUrl: './siteAudit.component.html'
})
export class SiteAuditComponent implements OnInit, AfterViewChecked {
    isAdmin = false;
    @ViewChild('tabs') private tabs: NgbTabset;

    constructor(public userService: UserService,
                private route: ActivatedRoute) {
        this.userService.then(user => this.isAdmin = isSiteAdmin(user), _noop);
    }

    ngOnInit() {
        if (this.route.snapshot.queryParams['triggerClientError']) {
            throw new Error("An exception has been thrown");
        }
    }

    ngAfterViewChecked(): void {
        if (this.route.snapshot.queryParams['tab']) {
            let tab = this.route.snapshot.queryParams['tab'];
            this.tabs.select(tab);
        }
    }

}
