import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Article } from 'shared/article/article.model';
import { AlertService } from 'alert/alert.service';

@Component({
    selector: 'cde-resources-admin',
    templateUrl: './resourcesAdmin.component.html'
})
export class ResourcesAdminComponent {
    resource?: Article;

    constructor(private http: HttpClient,
                private alertSvc: AlertService) {
        this.http.get<Article>("/server/article/resources")
            .subscribe(resource => this.resource = resource ? resource : {key: "resources", body: ""},
                err => this.alertSvc.addAlert('danger', err));
    }

    save() {
        this.http.post("/server/article/resources", this.resource)
            .subscribe(() => this.alertSvc.addAlert("info", "Saved"),
                err => this.alertSvc.addAlert('danger', err));
    }

    upload(event) {
        if (event.srcElement && event.srcElement.files) {
            let files = event.srcElement.files;
            let formData = new FormData();
            for (let i = 0; i < files.length; i++) {
                formData.append('uploadedFiles', files[i]);
            }
            formData.append('id', this.resource._id);
            this.http.post<Article>('/server/attachment/article/add', formData).subscribe(
                res => this.resource = res,
                err => this.alertSvc.addAlert('danger', err));
        }
    }

    removeAttachment(event) {
        this.http.post<Article>('/server/attachment/article/remove', {
            index: event,
            id: this.resource._id
        }).subscribe(res => {
            this.resource = res;
            this.alertSvc.addAlert('success', 'Attachment Removed.');
        });
    }

}