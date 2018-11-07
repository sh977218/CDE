import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Article } from 'shared/article/article.model';

@Injectable()
export class ResourcesResolve implements Resolve<Article> {

    constructor(private http: HttpClient) {
    }

    resolve(route: ActivatedRouteSnapshot) {
        return this.http.get<Article>("/server/article/resources").toPromise();
    }
}