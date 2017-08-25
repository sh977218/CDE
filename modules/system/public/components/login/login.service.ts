import { Injectable } from "@angular/core";
import "rxjs/add/operator/map";
import { Http } from "@angular/http";

@Injectable()
export class LoginService {

    lastRoute: string;

    constructor(private http: Http) {}

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