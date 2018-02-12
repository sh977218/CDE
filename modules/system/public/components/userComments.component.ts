import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';

import { UserService } from '_app/user.service';
import { Comment, DiscussionComments } from 'shared/models.model';


@Component({
    selector: 'cde-user-comments',
    templateUrl: './userComments.component.html'
})
export class UserCommentsComponent implements OnInit {
    @Input() user: any;
    comments: DiscussionComments;
    getEltLink = UserService.getEltLink;
    pageSize: Number = 30;
    page: Number = 1;

    ngOnInit() {
        this.getComments(1);
    }

    constructor(
        private http: HttpClient
    ) {
        this.comments = {currentCommentsPage: 1, totalItems: 10000, latestComments: []};
    }

    getComments(page) {
        //noinspection TypeScriptValidateTypes
        this.http.get<Comment[]>('/commentsFor/' + this.user.username + '/' + (page - 1) * 30 + '/30').subscribe(comments => {
            this.comments.latestComments = comments;
            let len = this.comments.latestComments.length;
            this.comments.totalItems = (page - 1) * 30 + len + (len === 30 ? 1 : 0);
        });
    }
}
