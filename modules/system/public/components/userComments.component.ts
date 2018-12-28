import { HttpClient } from '@angular/common/http';
import { Component, Input } from '@angular/core';

import { UserService } from '_app/user.service';
import { Comment, DiscussionComments, User } from 'shared/models.model';
import { PageEvent } from '@angular/material';

@Component({
    selector: 'cde-user-comments',
    templateUrl: './userComments.component.html'
})
export class UserCommentsComponent {
    @Input() user!: User;
    comments: DiscussionComments;
    getEltLink = UserService.getEltLink;
    pageSize: number = 30;
    page: number = 0;

    constructor(
        private http: HttpClient
    ) {
        this.comments = {currentCommentsPage: 1, totalItems: 10000, latestComments: []};
        this.getComments();
    }

    getComments(event?: PageEvent) {
        if (event) {
            this.page = event.pageIndex;
        }

        //noinspection TypeScriptValidateTypes
        this.http.get<Comment[]>('/server/discuss/commentsFor/' + this.user.username + '/' + (this.page) * 30 + '/30')
            .subscribe(comments => {
                this.comments.latestComments = comments;
                let len = this.comments.latestComments.length;
                this.comments.totalItems = this.page * 30 + len + (len === 30 ? 1 : 0);
            }, () => {
            });
    }
}
