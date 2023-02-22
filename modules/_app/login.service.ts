import { HttpClient } from '@angular/common/http';
import { forwardRef, Inject, Injectable, NgZone } from '@angular/core';
import { ActivatedRoute, Router, UrlTree } from '@angular/router';
import { environment } from 'environments/environment';
import { UserService } from '_app/user.service';
import { AlertService } from 'alert/alert.service';

@Injectable()
export class LoginService {
    federatedUrl: string = '';
    lastRoute: UrlTree;
    loginWindow: Window | null = null;

    constructor(
        @Inject(forwardRef(() => ActivatedRoute)) private route: ActivatedRoute,
        @Inject(forwardRef(() => AlertService)) private alert: AlertService,
        @Inject(forwardRef(() => HttpClient)) private http: HttpClient,
        @Inject(forwardRef(() => Router)) private router: Router,
        @Inject(forwardRef(() => UserService)) private userService: UserService,
        @Inject(forwardRef(() => NgZone)) public ngZone: NgZone
    ) {}

    goToLogin() {
        if (window.location.href.indexOf('login') === -1) {
            this.router.navigate(['/login']);
        }
    }

    loggedIn() {
        this.userService.reload(() => {
            const queryParams = this.lastRoute.queryParams;
            const fragment = this.lastRoute.fragment;
            this.lastRoute.queryParams = {};
            this.lastRoute.fragment = null;
            const url = this.lastRoute.toString();
            this.router.navigate([url], {
                queryParams,
                fragment,
            });
        });
    }

    openLogin() {
        this.federatedUrl = `${environment.federatedLogin}?service=${window.location.origin}/loginFederated`;
        this.loginWindow = window.open(this.federatedUrl);
        if (this.loginWindow) {
            window.loggedIn = () => {
                this.ngZone.run(() => {
                    this.loggedIn();
                });
            };
        }
    }
}
