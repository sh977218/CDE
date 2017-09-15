import { Injectable } from "@angular/core";
import "rxjs/add/operator/map";
import { Http } from "@angular/http";
import { Router } from "@angular/router";

@Injectable()
export class LoginService {

    lastRoute: string;

    constructor(private http: Http,
                private router: Router) {}

    public getPreviousRoute () {
        return this.lastRoute;
    }

    public logout() {
        this.http.post("/logout", {}).subscribe(() => {
            window.location.href = "/login";
       });
    }

    goToLogin () {
        if (window.location.href.indexOf('login') === -1) this.lastRoute = window.location.href;
    };

}