import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Article } from 'shared/article/article.model';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'cde-about',
    templateUrl: 'about.component.html'
})
export class AboutComponent {
    about?: Article;

    constructor(private http: HttpClient,
                private activatedRoute: ActivatedRoute) {
        this.http.get<Article>(`/server/article/about`)
            .subscribe(a => this.about = a);
    }
}
