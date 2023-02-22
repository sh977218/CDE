import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { AlertService } from 'alert/alert.service';
import { Article } from 'shared/article/article.model';
import { ArticleHelpDialogComponent } from 'settings/article/articleHelpDialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'cde-article-admin',
    templateUrl: './articleAdmin.component.html',
})
export class ArticleAdminComponent {
    article!: Partial<Article>;
    articles = ['whatsNew', 'contactUs', 'videos', 'guides', 'about', 'resources', 'nihDataSharing'];
    selectedKey?: string;

    constructor(private http: HttpClient, public dialog: MatDialog, private alertSvc: AlertService) {}

    save() {
        this.http.post('/server/article/' + this.selectedKey, this.article).subscribe(
            () => this.alertSvc.addAlert('info', 'Saved'),
            () => this.alertSvc.addAlert('danger', 'Unexpected error saving article')
        );
    }

    keyChanged() {
        this.http.get<Article>('/server/article/' + this.selectedKey).subscribe(article => {
            this.article = article ? article : { key: this.selectedKey, body: '' };
        });
    }

    upload(event: Event) {
        if (event.srcElement && (event.srcElement as HTMLInputElement).files) {
            const files = (event.srcElement as HTMLInputElement).files;
            const formData = new FormData();
            if (files) {
                /* tslint:disable */
                for (let i = 0; i < files.length; i++) {
                    formData.append('uploadedFiles', files[i]);
                }
                /* tslint:disable */
            }
            formData.append('id', this.article._id || '');
            this.http.post<Article>('/server/attachment/article/add', formData).subscribe(
                res => (this.article = res),
                () => this.alertSvc.addAlert('danger', 'Unexpected error attaching')
            );
        }
    }

    removeAttachment(event: number) {
        this.http
            .post<Article>('/server/attachment/article/remove', {
                index: event,
                id: this.article._id,
            })
            .subscribe(res => {
                this.article = res;
                this.alertSvc.addAlert('success', 'Attachment Removed.');
            });
    }

    openHelp(): void {
        this.dialog.open(ArticleHelpDialogComponent, { width: '500px' });
    }
}
