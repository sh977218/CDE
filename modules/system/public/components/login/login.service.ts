import { Injectable } from "@angular/core";
import "rxjs/add/operator/map";
import { Http } from "@angular/http";
import { Router } from "@angular/router";
import { UserService } from 'core/public/user.service';

@Injectable()
export class LoginService {

    lastRoute: string;

    constructor(private http: Http,
                private router: Router,
                private userService: UserService) {}

    public getPreviousRoute () {
        return this.lastRoute;
    }

    public logout() {
        this.http.post("/logout", {}).subscribe(() => {
            this.userService.reload();
            this.router.navigate(["/login"]);
       });
    }

    goToLogin () {
        if (window.location.href.indexOf('login') === -1) this.lastRoute = this.router.url;
    };

}