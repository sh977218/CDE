import { Injectable } from '@angular/core';
import { Resolve, Router } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import { HttpClient } from "@angular/common/http";
import { Article } from 'core/article/article.model';
import { catchError } from 'rxjs/operators';
import { EMPTY } from 'rxjs';

@Injectable()
export class ResourceResolve implements Resolve<Observable<Article>> {
    constructor(private router: Router,
                public http: HttpClient) {
    }

    resolve() {
        return this.http.get<Article>('/server/article/resourcesAndFeed')
            .pipe(catchError(() => {
                this.router.navigate(["/404"]);
                return EMPTY;
            }));
    }
}