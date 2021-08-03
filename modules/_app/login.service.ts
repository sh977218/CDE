import { HttpClient } from '@angular/common/http';
import { forwardRef, Inject, Injectable, NgZone } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { UserService } from '_app/user.service';
import { AlertService } from 'alert/alert.service';

interface SavedRoute {
    url: string;
    queryParams: Params | null;
}

function paramToQueryString(p: Params | null) {
    if (!p) {
        return '';
    }
    const q = Object.keys(p).map(k => k + '=' + p[k]).join('&');
    return q ? '?' + q : '';
}

@Injectable()
export class LoginService {
    federatedUrl: string = '';
    lastRoute?: SavedRoute;
    loginWindow: Window | null = null;

    constructor(
        @Inject(forwardRef(() => ActivatedRoute)) private route: ActivatedRoute,
        @Inject(forwardRef(() => AlertService)) private alert: AlertService,
        @Inject(forwardRef(() => HttpClient)) private http: HttpClient,
        @Inject(forwardRef(() => Router)) private router: Router,
        @Inject(forwardRef(() => UserService)) private userService: UserService,
        @Inject(forwardRef(() => NgZone)) public ngZone: NgZone
    ) {
    }

    getPreviousRoute(): SavedRoute {
        if (this.lastRoute) {
            return this.lastRoute;
        }
        const url = window.sessionStorage.getItem('nlmcde.lastRoute');
        if (url) {
            const savedQuery = window.sessionStorage.getItem('nlmcde.lastRouteQuery');
            let queryParams: Params | null = null;
            try {
                queryParams = savedQuery && JSON.parse(savedQuery);
            } catch (e) {
            }
            window.sessionStorage.removeItem('nlmcde.lastRoute');
            window.sessionStorage.removeItem('nlmcde.lastRouteQuery');
            return {url, queryParams};
        } else {
            return {url: '/home', queryParams: null};
        }
    }

    goToLogin() {
        if (window.location.href.indexOf('login') === -1) {
            this.lastRoute = {
                url: this.router.url.toString() + '',
                queryParams: this.route.snapshot.queryParams
            };
            if (this.lastRoute.url.indexOf('?') > 0) {
                this.lastRoute.url = this.lastRoute.url.substr(0, this.lastRoute.url.indexOf('?'));
            }
        }
    }

    loggedIn() {
        this.userService.reload(() => {
            const lastRoute = this.getPreviousRoute();
            this.router.navigate(
                [lastRoute.url],
                {queryParams: lastRoute.queryParams}
            );
        });
    }

    openLogin() {
        this.federatedUrl = `${window.federatedLogin}?service=${window.location.origin}/loginFederated`;
        this.loginWindow = window.open(this.federatedUrl, '_blank');
        if (this.loginWindow) {
            window.loggedIn = () => {
                this.ngZone.run(() => {
                    this.loggedIn();
                });
            }
        } else {
            if (this.lastRoute) {
                window.sessionStorage.setItem('nlmcde.lastRoute', this.lastRoute.url);
                window.sessionStorage.setItem('nlmcde.lastRouteQuery', paramToQueryString(this.lastRoute.queryParams));
            }
            window.location.href = this.federatedUrl;
        }
    }
}
