import { Injectable } from '@angular/core';
import { Resolve, Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { LoginService } from '_app/login.service';

@Injectable()
export class LoginResolve implements Resolve<Observable<UrlTree>> {
    constructor(private router: Router, private loginService: LoginService) {}

    resolve(): Observable<UrlTree> {
        const urlTree: UrlTree = this.router.parseUrl(this.router.url);
        this.loginService.lastRoute = urlTree;
        return of(urlTree);
    }
}
