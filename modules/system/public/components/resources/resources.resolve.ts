import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Resolve, Router } from '@angular/router';
import { Article } from 'shared/article/article.model';
import { catchError } from 'rxjs/operators';
import { empty } from 'rxjs/observable/empty';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class ResourceResolve implements Resolve<Observable<Article>> {
    constructor(private router: Router,
                public http: HttpClient) {
    }

    resolve() {
        return this.http.get<Article>('/server/article/resourcesAndFeed')
            .pipe(catchError(() => {
                this.router.navigate(['/404']);
                return empty();
            }));
    }
}
