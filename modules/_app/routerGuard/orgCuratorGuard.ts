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
import { isOrgCurator } from 'shared/system/authorizationShared';

@Injectable()
export class OrgCuratorGuard implements CanActivate, CanActivateChild, CanLoad {
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
            if (isOrgCurator(user)) {
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
