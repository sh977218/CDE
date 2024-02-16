import { Component, NgZone } from '@angular/core';
import { environment } from '../environments/environment';
import { ActivatedRoute, Router, UrlTree } from '@angular/router';
import { UserService } from '../_app/user.service';

@Component({
    selector: 'cde-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    standalone: true,
})
export class LoginComponent {
    federatedUrl: string = '';
    lastRoute!: UrlTree;
    loginWindow: Window | null = null;

    constructor(
        public ngZone: NgZone,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private userService: UserService
    ) {
        if (this.activatedRoute.snapshot.data.lastRoute) {
            this.lastRoute = this.activatedRoute.snapshot.data.lastRoute;
        }
    }

    loggedIn() {
        this.userService.reload().then(() => {
            const queryParams = this.lastRoute.queryParams;
            const fragment = this.lastRoute.fragment;
            this.lastRoute.queryParams = {};
            this.lastRoute.fragment = null;
            const url = this.lastRoute.toString() || '/home';
            this.router.navigate([url], {
                queryParams,
                fragment: fragment || undefined,
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
