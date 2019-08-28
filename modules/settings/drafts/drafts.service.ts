import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Article } from 'core/article/article.model';

@Injectable()
export class DraftsService {

    constructor(public http: HttpClient) {
    }

    myDrafts() {
        return this.http.get<Article>('/myDrafts');
    }

    myOrgDrafts() {
        return this.http.get<Article>('/orgDrafts');
    }

    allDrafts() {
        return this.http.get<Article>('/allDrafts');
    }
}
