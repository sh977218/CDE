import { Component, OnInit, Inject } from "@angular/core";
import { Http } from "@angular/http";
import "rxjs/add/operator/map";
import { AlertService } from "../alert/alert.service";
import { LoginService } from "./login.service";
import { UserService } from "../../../../core/public/user.service";

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
    recaptcha: string;
    redirectRoute: string;

    constructor(private http: Http,
                private alert: AlertService,
                private loginSvc: LoginService,
                private userService: UserService) {}

    ngOnInit() {
        this.getCsrf();
        this.redirectRoute = this.loginSvc.getPreviousRoute() ? this.loginSvc.getPreviousRoute() : "/home";
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