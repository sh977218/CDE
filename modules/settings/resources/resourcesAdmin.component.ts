import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { AlertService } from 'alert/alert.service';
import { Article } from 'core/article/article.model';

@Component({
    selector: 'cde-resources-admin',
    templateUrl: './resourcesAdmin.component.html'
})
export class ResourcesAdminComponent {
    resource!: Partial<Article>;

    constructor(private http: HttpClient,
                private alertSvc: AlertService) {
        this.http.get<Article>('/server/article/resources')
            .subscribe(resource => this.resource = resource ? resource : {key: 'resources', body: ''},
                () => this.alertSvc.addAlert('danger', 'Unexpected error loading article'));
    }

    save() {
        this.http.post('/server/article/resources', this.resource)
            .subscribe(() => this.alertSvc.addAlert('info', 'Saved'),
                () => this.alertSvc.addAlert('danger', 'Unexpected error saving classification'));
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
            formData.append('id', this.resource._id || '');
            this.http.post<Article>('/server/attachment/article/add', formData).subscribe(
                res => this.resource = res,
                () => this.alertSvc.addAlert('danger', 'Unexpected error attaching'));
        }
    }

    removeAttachment(event: number) {
        this.http.post<Article>('/server/attachment/article/remove', {
            index: event,
            id: this.resource._id
        }).subscribe(res => {
            this.resource = res;
            this.alertSvc.addAlert('success', 'Attachment Removed.');
        });
    }
}
