import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '_app/login.service';
import { UserService } from '_app/user.service';
import { AlertService } from 'alert/alert.service';

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

        .form-signin .btn {
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
export class LoginComponent {
    csrf?: string;
    password?: string;
    recaptcha?: string;
    showCaptcha?: boolean;
    siteKey: string = (window as any).siteKey;
    username?: string;

    constructor(private http: HttpClient,
                private alert: AlertService,
                private loginSvc: LoginService,
                private userService: UserService,
                private router: Router) {
        this.getCsrf();
    }

    getCsrf() {
        delete this.csrf;
        this.http.get<any>('/server/system/csrf').subscribe(response => {
            this.csrf = response.csrf;
            this.showCaptcha = response.showCaptcha;
        }, () => {
        });
    }

    login() {
        if (!this.csrf) {
            return;
        }
        this.http.post('/server/system/login', {
            username: this.username,
            password: this.password,
            _csrf: this.csrf,
            recaptcha: this.recaptcha
        }, {responseType: 'text'}).subscribe(res => {
            this.userService.reload();
            if (res === 'OK') {
                if (this.loginSvc.getPreviousRoute()) {
                    this.router.navigate(
                        [this.loginSvc.getPreviousRoute().url],
                        {queryParams: this.loginSvc.getPreviousRoute().queryParams}
                    );
                } else {
                    this.router.navigate(['/home']);
                }
            } else {
                this.alert.addAlert('danger', res);
                this.getCsrf();
            }
        }, (err: HttpErrorResponse) => {
            if (err.status === 412) {
                this.alert.addAlert('danger', 'Please fill out the Captcha before login in.');
            } else {
                let res;
                if (err.error) {
                    res = JSON.parse(err.error);
                }
                this.alert.addAlert('danger', 'Failed to log in.' + (res && res.message ? ' ' + res.message : ''));
            }
            this.getCsrf();
        });
        delete this.csrf;
    }

    resolved(e: any) {
        this.recaptcha = e;
    }
}
