import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Article } from 'shared/article/article.model';
import { AlertService } from 'alert/alert.service';

@Component({
    selector: 'cde-resources',
    templateUrl: './resources.component.html'
})
export class ResourcesComponent {
    resource: Article = new Article();

    constructor(private http: HttpClient,
                private alertSvc: AlertService) {
        this.http.get<Article>("/server/article/resources")
            .subscribe(a => this.resource = a,
                err => this.alertSvc.addAlert('danger', err));
    }

    save() {
        this.http.post("/server/article/resources", this.resource)
            .subscribe(() => this.alertSvc.addAlert("info", "Saved"),
                err => this.alertSvc.addAlert('danger', err));
    }

}
