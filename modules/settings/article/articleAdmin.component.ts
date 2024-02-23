import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AlertService } from 'alert/alert.service';
import { fileInputToFormData } from 'non-core/browser';
import { ArticleHelpDialogComponent } from 'settings/article/articleHelpDialog.component';
import { Article } from 'shared/article/article.model';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

@Component({
    selector: 'cde-article-admin',
    templateUrl: './articleAdmin.component.html',
    styleUrls: ['./articleAdmin.component.scss'],
})
export class ArticleAdminComponent {
    article!: Partial<Article>;
    articles = ['whatsNew', 'contactUs', 'videos', 'guides', 'about', 'resources', 'nihDataSharing', 'shutdownBanner'];
    selectedKey?: string;

    constructor(private http: HttpClient, public dialog: MatDialog, private alertSvc: AlertService) {}

    onShutDownToggleChange(event: MatSlideToggleChange) {
        this.article.active = event.checked;
        this.save();
    }

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
        const formData = fileInputToFormData(event.srcElement as HTMLInputElement);
        if (formData) {
            formData.append('id', this.article._id || '');
            this.http.post<Article>('/server/attachment/article/add', formData).subscribe(
                res => {
                    this.article = res;
                    this.alertSvc.addAlert('success', 'Attachment added.');
                },
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
