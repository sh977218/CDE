import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Article } from 'shared/article/article.model';

@Injectable({ providedIn: 'root' })
export class DraftsService {
    constructor(public http: HttpClient) {}

    myDrafts() {
        return this.http.get<Article>('/server/system/myDrafts');
    }

    myOrgDrafts() {
        return this.http.get<Article>('/server/system/orgDrafts');
    }

    allDrafts() {
        return this.http.get<Article>('/server/system/allDrafts');
    }
}
