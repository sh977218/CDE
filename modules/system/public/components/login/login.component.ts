import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '_app/login.service';
import { UserService } from '_app/user.service';
import { AlertService } from 'alert/alert.service';

@Component({
    selector: 'cde-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
    csrf?: string;
    password?: string;
    showCaptcha?: boolean;
    username?: string;
    federatedUrl = `${(window as any).federatedLogin}?service=${(window as any).publicUrl}/login/federated`;

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

}
