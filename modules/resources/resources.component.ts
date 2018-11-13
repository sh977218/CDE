import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Article } from 'shared/article/article.model';
import { AlertService } from 'alert/alert.service';

@Component({
    selector: 'cde-resources',
    templateUrl: './resources.component.html'
})
export class ResourcesComponent {
    resource: Article;

    constructor(private http: HttpClient,
                private route: ActivatedRoute,
                private alertSvc: AlertService) {
        this.resource = this.route.snapshot.data['resource'];
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
