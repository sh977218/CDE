import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { Article } from 'shared/article/article.model';
import { AlertService } from 'alert/alert.service';
import { UserService } from '_app/user.service';

import { hasRole } from 'shared/system/authorizationShared';

@Component({
    selector: 'cde-resources',
    templateUrl: './resources.component.html'
})
export class ResourcesComponent {
    resource: Article;
    canEdit;
    RSS_FEED = [];

    constructor(private http: HttpClient,
                public userService: UserService,
                private alertSvc: AlertService) {
        this.canEdit = hasRole(this.userService.user, 'DocumentationEditor');

        this.http.get<any>('/server/article/resources')
            .subscribe(res => this.resource = res,
                err => this.alertSvc.addAlert('danger', err));

        this.http.get<any>('/server/article/rss/feeds')
            .subscribe(res => this.RSS_FEED = res,
                err => this.alertSvc.addAlert('danger', err));
    }

}
