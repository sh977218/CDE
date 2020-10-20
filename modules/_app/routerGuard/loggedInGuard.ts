import { forwardRef, Inject, Injectable } from '@angular/core';
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

@Injectable()
export class LoggedInGuard implements CanActivate, CanActivateChild, CanLoad {
    constructor(
        @Inject(forwardRef(() => Router)) private router: Router,
        @Inject(forwardRef(() => UserService)) private userService: UserService,
    ) {}

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
        this.userService.reload();
        return this.userService.then(() => true, () => {
            this.router.navigate(['/login']);
            return false;
        });
    }
}
