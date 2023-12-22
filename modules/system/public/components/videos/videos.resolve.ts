import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Article } from 'shared/article/article.model';
import { EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class VideosResolve {
    constructor(private router: Router, public http: HttpClient) {}

    resolve() {
        return this.http.get<Article>('/server/article/videosAndIframe').pipe(
            catchError(() => {
                this.router.navigate(['/404']);
                return EMPTY;
            })
        );
    }
}
