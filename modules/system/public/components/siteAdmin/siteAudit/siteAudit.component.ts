import { Component } from '@angular/core';
import _noop from 'lodash/noop';

import { UserService } from '_app/user.service';
import { isSiteAdmin } from 'shared/system/authorizationShared';

@Component({
    selector: 'cde-site-audit',
    templateUrl: './siteAudit.component.html'
})
export class SiteAuditComponent  {
    isAdmin = false;

    constructor(public userService: UserService) {
        this.userService.then(user => this.isAdmin = isSiteAdmin(user), _noop);
    }
}
