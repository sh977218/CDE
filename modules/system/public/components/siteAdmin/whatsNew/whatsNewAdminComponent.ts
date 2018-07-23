import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Article } from 'shared/article/article.model';
import { AlertService } from '_app/alert.service';

@Component({
    selector: 'cde-whats-new-admin',
    templateUrl: './whatsNewAdmin.component.html'
})
export class WhatsNewAdminComponent {

    article: Article;

    constructor(private http: HttpClient,
                private alertSvc: AlertService) {
        this.http.get<Article>("/server/article/whatsNew").subscribe(article => {
            this.article = article ? article : {key: "whatsNew", body: ""};
        });
    }

    save() {
        this.http.post("/server/article/whatsNew", this.article).subscribe(() =>
            this.alertSvc.addAlert("info", "Saved"));
    }

}
