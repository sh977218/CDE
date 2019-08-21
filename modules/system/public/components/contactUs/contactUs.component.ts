import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Article } from 'core/article/article.model';

@Component({
    selector: 'cde-contact-us',
    templateUrl: 'contactUs.component.html'
})
export class ContactUsComponent {
    article?: Article;

    constructor(private http: HttpClient) {
        this.http.get<Article>('/server/article/contactUs').subscribe(a => this.article = a);
    }
}
