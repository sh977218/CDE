import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    CanActivate,
    CanActivateChild,
    CanLoad,
    Route,
    Router,
    RouterStateSnapshot,
} from '@angular/router';

import { UserService } from '_app/user.service';
import { isSiteAdmin } from 'shared/system/authorizationShared';

@Injectable()
export class SiteAdminGuard implements CanActivate, CanActivateChild, CanLoad {
    constructor(private userService: UserService, private router: Router) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
        return this.checkLogin();
    }

    canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
        return this.canActivate(route, state);
    }

    canLoad(route: Route): Promise<boolean> {
        return this.checkLogin();
    }

    checkLogin(): Promise<boolean> {
        return this.userService.then(user => {
            if (isSiteAdmin(user)) {
                return true;
            } else {
                this.router.navigate(['/home']);
                return false;
            }
        }, () => {
            this.router.navigate(['/login']);
            return false;
        });
    }
}
