import { Component, OnInit, Inject } from "@angular/core";
import { Http } from "@angular/http";
import "rxjs/add/operator/map";
import { AlertService } from "../alert/alert.service";
import { LoginService } from "./login.service";

@Component({
    selector: "cde-login",
    templateUrl: "login.component.html"
})
export class LoginComponent implements OnInit {

    csrf: string;
    showCaptcha: boolean;
    username: string;
    password: string;
    siteKey: string = (window as any).siteKey;
    redirectRoute: string;

    constructor(private http: Http,
                private alert: AlertService,
                private loginSvc: LoginService,
                @Inject("userResource") private userService) {}

    ngOnInit() {
        this.getCsrf();
        this.redirectRoute = this.loginSvc.getPreviousRoute() ? this.loginSvc.getPreviousRoute() : "/home";
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
            _csrf: this.csrf
        }).map(r => r.text()).subscribe(res => {
            this.userService.getRemoteUser();
            if (res === "OK") {
                (document.querySelector('#goPrevious')as any).click();
            } else {
                this.alert.addAlert("danger", res);
                this.getCsrf();
            }
        }, res => {
            if (res.status === 412) {
                this.alert.addAlert("danger", "Please fill out the Captcha before login in.");
            } else {
                this.alert.addAlert("danger", "Failed to log in.");
            }
            this.getCsrf();
        });

    };

}