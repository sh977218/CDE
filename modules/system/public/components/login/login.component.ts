import { Component, OnInit } from '@angular/core';
import { Http } from '@angular/http';
import { Router } from '@angular/router';

import { AlertService } from '_app/alert/alert.service';
import { LoginService } from '_app/login.service';
import { UserService } from '_app/user.service';

@Component({
    selector: 'cde-login',
    templateUrl: 'login.component.html'
})
export class LoginComponent implements OnInit {

    csrf: string;
    showCaptcha: boolean;
    username: string;
    password: string;
    siteKey: string = (window as any).siteKey;
    recaptcha: string;

    constructor(private http: Http,
                private alert: AlertService,
                private loginSvc: LoginService,
                private userService: UserService,
                private router: Router) {}

    ngOnInit() {
        this.getCsrf();
    }

    resolved (e) {
        this.recaptcha = e;
    }

    getCsrf() {
        delete this.csrf;
        this.http.get('/csrf').map(r => r.json()).subscribe(response => {
            this.csrf = response.csrf;
            this.showCaptcha = response.showCaptcha;
        }, () => {});
    }

    login() {
        this.http.post('/login', {
            username: this.username,
            password: this.password,
            _csrf: this.csrf,
            recaptcha: this.recaptcha
        }).map(r => r.text()).subscribe(res => {
            this.userService.reload();
            if (res === 'OK') {
                if (this.loginSvc.getPreviousRoute()) {
                    this.router.navigate([this.loginSvc.getPreviousRoute().url], {queryParams: this.loginSvc.getPreviousRoute().queryParams});
                } else {
                    this.router.navigate(['/home']);
                }
            } else {
                this.alert.addAlert('danger', res);
                this.getCsrf();
            }
        }, res => {
            if (res.status === 412) {
                this.alert.addAlert('danger', 'Please fill out the Captcha before login in.');
            } else {
                this.alert.addAlert('danger', 'Failed to log in.');
            }
            this.getCsrf();
        });

    };

}