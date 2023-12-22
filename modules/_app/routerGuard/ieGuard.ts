import { forwardRef, Inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Route, Router, RouterStateSnapshot } from '@angular/router';

const isIE = /MSIE|Trident/.test(window.navigator.userAgent);

@Injectable()
export class IEGuard {
    constructor(@Inject(forwardRef(() => Router)) private router: Router) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return this.checkIE();
    }

    canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return this.canActivate(route, state);
    }

    canLoad(route: Route) {
        return this.checkIE();
    }

    checkIE() {
        return isIE ? this.router.createUrlTree(['/ieDiscontinued']) : true;
    }
}
