import { HttpClient } from '@angular/common/http';
import { forwardRef, Inject, Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '_app/user.service';
import { AlertService } from 'alert/alert.service';

@Injectable()
export class LoginService {
    lastRoute: any;

    constructor(
        @Inject(forwardRef(() => ActivatedRoute)) private route: ActivatedRoute,
        @Inject(forwardRef(() => AlertService)) private alert: AlertService,
        @Inject(forwardRef(() => HttpClient)) private http: HttpClient,
        @Inject(forwardRef(() => Router)) private router: Router,
        @Inject(forwardRef(() => UserService)) private userService: UserService,
    ) {}

    getPreviousRoute() {
        return this.lastRoute;
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

    logout() {
        const refreshAndLogin = () => {
            this.userService.reload();
            this.router.navigate(['/login']);
        };
        this.http.post('/server/system/logout', {}, {responseType: 'text'}).subscribe(
            refreshAndLogin,
            refreshAndLogin // ignore error in favor of already being logged out
        );
    }
}
