import { Injectable } from '@angular/core';

import { UserService } from '_app/user.service';
import { isOrgCurator, isSiteAdmin, hasRole } from 'shared/system/authorizationShared';


@Injectable()
export class IsAllowedService {
    constructor(private userService: UserService) {}

    isAllowed (CuratedItem) {
        if (!CuratedItem) return false;
        if (CuratedItem.archived) {
            return false;
        }
        if (this.userService.user && this.userService.user.siteAdmin) {
            return true;
        } else {
            if (CuratedItem.registrationState.registrationStatus === "Standard" ||
                CuratedItem.registrationState.registrationStatus === "Preferred Standard") {
                return false;
            }
            if (this.userService.userOrgs) {
                return isOrgCurator(this.userService.user, CuratedItem.stewardOrg.name);
            } else {
                return false;
            }
        }
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
        if (elt.elementType === 'board') {
            return this.userService.user.siteAdmin || (this.userService.user.username === elt.owner.username);
        } else {
            return this.userService.user &&
                (this.userService.user.siteAdmin || (this.userService.user._id &&
                    (this.userService.user.orgAdmin.indexOf(elt.stewardOrg.name) > -1)));
        }
    }

    loggedIn () {
        return !!(this.userService.user && this.userService.user._id);
    }
}
