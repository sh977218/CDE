import { Injectable } from '@angular/core';

import { UserService } from '_app/user.service';
import { canEditCuratedItem, isOrgCurator, isSiteAdmin, hasRole } from 'shared/system/authorizationShared';


@Injectable()
export class IsAllowedService {
    constructor(private userService: UserService) {}

    isAllowed (CuratedItem) {
        return canEditCuratedItem(this.userService.user, CuratedItem);
    }

    isOrgCurator () {
        return isOrgCurator(this.userService.user);
    }

    hasRole (role) {
        return hasRole(this.userService.user, role);
    }

    isSiteAdmin () {
        return isSiteAdmin(this.userService.user);
    }

    doesUserOwnElt (elt) {
        if (!this.userService.user) return false;
        if (elt.elementType === 'board') {
            return this.userService.user.siteAdmin || this.userService.user.username === elt.owner.username;
        } else {
            return this.userService.user.siteAdmin || this.userService.user.orgAdmin.indexOf(elt.stewardOrg.name) > -1;
        }
    }

    loggedIn () {
        return !!this.userService.user;
    }
}
