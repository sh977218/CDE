import { Injectable } from '@angular/core';
import { UserService } from 'core/user.service';

import * as authShared from "system/shared/authorizationShared";

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
                return authShared.isCuratorOf(this.userService.user, CuratedItem.stewardOrg.name);
            } else {
                return false;
            }
        }
    }

    isOrgCurator () {
        return authShared.isOrgCurator(this.userService.user);
    }

    hasRole (role) {
        return authShared.hasRole(this.userService.user, role);
    }

    isSiteAdmin () {
        return authShared.isSiteAdmin(this.userService.user);
    }

    doesUserOwnElt (elt) {
        if (elt.elementType === 'board') {
            return this.userService.user.siteAdmin || (this.userService.user.username === elt.owner.username);
        } else
            return this.userService.user &&
                (this.userService.user.siteAdmin || (this.userService.user._id &&
                    (this.userService.user.orgAdmin.indexOf(elt.stewardOrg.name) > -1)));
    };

    loggedIn () {
        return !!(this.userService.user && this.userService.user._id);
    }


}