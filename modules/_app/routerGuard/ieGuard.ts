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

@Injectable()
export class IEGuard implements CanActivate, CanActivateChild, CanLoad {
    constructor(private userService: UserService,
                private router: Router) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        return this.checkIE();
    }

    canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        return this.canActivate(route, state);
    }

    canLoad(route: Route): boolean {
        return this.checkIE();
    }

    checkIE(): boolean {
        const isIe = false || !!(document as any).documentMode;
        if (isIe) {
            this.router.navigate(['/ieDiscontinued']);
            return false;
        } else { return true; }
    }
}
