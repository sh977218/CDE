import { Injectable } from '@angular/core';
import { UserService } from '_app/user.service';
import { Item } from 'shared/item';
import { UserRole } from 'shared/models.model';
import { canEditCuratedItem, isOrgCurator, isSiteAdmin, hasRole } from 'shared/security/authorizationShared';

@Injectable({ providedIn: 'root' })
export class IsAllowedService {
    constructor(private userService: UserService) {}

    hasRole(role: UserRole) {
        return hasRole(this.userService.user, role);
    }

    isAllowed(curatedItem: Item) {
        return canEditCuratedItem(this.userService.user, curatedItem);
    }

    isOrgCurator() {
        return isOrgCurator(this.userService.user);
    }

    isSiteAdmin() {
        return isSiteAdmin(this.userService.user);
    }
}
