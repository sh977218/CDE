import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'alert/alert.service';
import { UserService } from '_app/user.service';


@Injectable()
export class LoginService {
    lastRoute: any;

    constructor(
        private http: HttpClient,
        private route: ActivatedRoute,
        private router: Router,
        private userService: UserService,
        private alert: AlertService
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
        this.http.post('/logout', {}, {responseType: 'text'}).subscribe(
            refreshAndLogin,
            refreshAndLogin // ignore error in favor of already being logged out
        );
    }
}
