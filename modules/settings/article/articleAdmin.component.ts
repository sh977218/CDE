import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { AlertService } from 'alert/alert.service';
import { Article } from 'shared/article/article.model';
import { ArticleHelpDialogComponent } from 'settings/article/articleHelpDialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'cde-article-admin',
    templateUrl: './articleAdmin.component.html'
})
export class ArticleAdminComponent {
    article?: Partial<Article>;
    articles = ['whatsNew', 'contactUs', 'videos', 'guides'];
    selectedKey?: string;

    constructor(private http: HttpClient,
                public dialog: MatDialog,
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

    openHelp(): void {
        this.dialog.open(ArticleHelpDialogComponent, {
            width: '500px'
        });
    }
}
