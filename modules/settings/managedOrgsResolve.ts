import { Injectable } from '@angular/core';
import { Resolve, Router } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import { Article } from 'core/article/article.model';
import { catchError } from 'rxjs/operators';
import { EMPTY } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class ManagedOrgsResolve implements Resolve<Observable<Article>> {
    constructor(private router: Router,
                private http: HttpClient) {
    }

    resolve() {
        return this.http.get<Article>('/managedOrgs')
            .pipe(catchError(() => {
                this.router.navigate(["/404"]);
                return EMPTY;
            }));
    }
}