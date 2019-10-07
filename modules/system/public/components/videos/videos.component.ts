import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Article } from 'shared/article/article.model';

@Component({
    selector: 'cde-videos',
    templateUrl: 'videos.component.html'
})
export class VideosComponent {
    article?: Article;

    constructor(private http: HttpClient) {
        this.http.get<Article>('/server/article/videos').subscribe(a => this.article = a);
    }
}
