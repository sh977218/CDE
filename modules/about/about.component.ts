import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Article } from 'shared/article/article.model';
import { ActivatedRoute } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
    selector: 'cde-about',
    templateUrl: 'about.component.html',
    imports: [NgIf],
    standalone: true,
})
export class AboutComponent {
    about?: Article;

    constructor(private http: HttpClient, private activatedRoute: ActivatedRoute) {
        this.http.get<Article>(`/server/article/about`).subscribe(a => (this.about = a));
    }
}
