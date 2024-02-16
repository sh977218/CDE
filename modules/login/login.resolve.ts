import { Injectable } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';

@Injectable()
export class LoginResolve {
    constructor(private router: Router) {}

    resolve(): Observable<UrlTree> {
        const urlTree: UrlTree = this.router.parseUrl(this.router.url);
        return of(urlTree);
    }
}
