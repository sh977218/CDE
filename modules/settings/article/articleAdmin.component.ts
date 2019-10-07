import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { AlertService } from 'alert/alert.service';
import { Article } from 'shared/article/article.model';

@Component({
    selector: 'cde-article-admin',
    templateUrl: './articleAdmin.component.html'
})
export class ArticleAdminComponent {
    article?: Partial<Article>;
    articles = ['whatsNew', 'contactUs', 'videos'];
    selectedKey?: string;

    constructor(private http: HttpClient,
                private alertSvc: AlertService) {
    }

    save() {
        this.http.post('/server/article/' + this.selectedKey, this.article).subscribe(() =>
            this.alertSvc.addAlert('info', 'Saved'));
    }

    keyChanged() {
        this.article = undefined;
        this.http.get<Article>('/server/article/' + this.selectedKey).subscribe(article => {
            this.article = article ? article : {key: this.selectedKey, body: ''};
        });
    }

}
