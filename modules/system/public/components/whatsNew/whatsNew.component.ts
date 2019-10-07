import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Article } from 'shared/article/article.model';

@Component({
    selector: 'cde-whats-new',
    templateUrl: 'whatsNew.component.html'
})
export class WhatsNewComponent {
    article?: Article;

    constructor(private http: HttpClient) {
        this.http.get<Article>('/server/article/whatsNew').subscribe(a => this.article = a);
    }
}
