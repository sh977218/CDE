import { Injectable } from "@angular/core";
import "rxjs/add/operator/map";
import { Http } from "@angular/http";
import { ActivatedRoute, Router } from "@angular/router";
import { UserService } from '_app/user.service';

@Injectable()
export class LoginService {

    lastRoute: any;

    constructor(private http: Http,
                private route: ActivatedRoute,
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
        if (window.location.href.indexOf('login') === -1) {
            this.lastRoute = {
                url: this.router.url.toString() + "",
                queryParams: this.route.snapshot.queryParams
            };
            if (this.lastRoute.url.indexOf('?') > 0) {
                this.lastRoute.url = this.lastRoute.url.substr(0, this.lastRoute.url.indexOf('?'));
            }
        }
    }

}