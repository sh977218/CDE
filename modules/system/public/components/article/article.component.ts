import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Article } from 'shared/article/article.model';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'cde-whats-new',
    templateUrl: 'article.component.html',
})
export class ArticleComponent {
    article?: Article;

    constructor(private http: HttpClient, private activatedRoute: ActivatedRoute) {
        this.http
            .get<Article>(`/server/article/${this.activatedRoute.snapshot.data.article}`)
            .subscribe(a => (this.article = a));
    }
}
