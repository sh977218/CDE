import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AlertService } from '_app/alert/alert.service';
import { LoginService } from '_app/login.service';
import { UserService } from '_app/user.service';


@Component({
    selector: 'cde-login',
    templateUrl: 'login.component.html',
    styles: [`        
        .form-signin {
            max-width: 330px;
            padding: 15px;
            margin: 0 auto;
        }

        .form-signin .form-signin-heading,
        .form-signin .checkbox {
            margin-bottom: 10px;
        }

        .form-signin .btn  {
            margin: 15px 0 10px 0;
        }

        .form-signin .form-control {
            position: relative;
            height: auto;
            -webkit-box-sizing: border-box;
            -moz-box-sizing: border-box;
            box-sizing: border-box;
            padding: 10px;
            font-size: 16px;
        }

        .form-signin .form-control:focus {
            z-index: 2;
        }

        .form-signin input[type="text"] {
            margin-bottom: -1px;
            border-bottom-right-radius: 0;
            border-bottom-left-radius: 0;
        }

        .form-signin input[type="password"] {
            border-top-left-radius: 0;
            border-top-right-radius: 0;
        }
    `]
})
export class LoginComponent implements OnInit {
    csrf: string;
    password: string;
    recaptcha: string;
    showCaptcha: boolean;
    siteKey: string = (window as any).siteKey;
    username: string;

    ngOnInit() {
        this.getCsrf();
    }

    constructor(
        private http: HttpClient,
        private alert: AlertService,
        private loginSvc: LoginService,
        private userService: UserService,
        private router: Router
    ) {
    }

    getCsrf() {
        delete this.csrf;
        this.http.get<any>('/csrf').subscribe(response => {
            this.csrf = response.csrf;
            this.showCaptcha = response.showCaptcha;
        }, () => {});
    }

    login() {
        this.http.post<any>('/login', {
            username: this.username,
            password: this.password,
            _csrf: this.csrf,
            recaptcha: this.recaptcha
        }).subscribe(res => {
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

    }

    resolved(e) {
        this.recaptcha = e;
    }
}
