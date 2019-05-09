import { Component, OnInit } from '@angular/core';
import { Comment, DataService, DiscussionComments, Drafts, User } from 'shared/models.model';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AlertService } from 'alert/alert.service';
import { PageEvent } from '@angular/material';
import { UserService } from '_app/user.service';

@Component({
    selector: 'cde-all-comments',
    templateUrl: './allComments.component.html'
})
export class AllCommentsComponent implements OnInit {
    user: User;
    comments: DiscussionComments;
    getEltLink = UserService.getEltLink;
    pageSize: number = 30;
    page: number = 0;

    constructor(private http: HttpClient,
                private userService: UserService,
                private alert: AlertService) {
        this.user = this.userService.user;
        this.comments = {currentCommentsPage: 1, totalItems: 10000, latestComments: []};
    }

    ngOnInit() {
        this.getComments();
    }

    getComments(event?: PageEvent) {
        if (event) {
            this.page = event.pageIndex;
        }

        this.http.get<Comment[]>('/server/discuss/allComments/' + this.page * 30 + '/30')
            .subscribe(comments => {
                this.comments.latestComments = comments;
                let len = this.comments.latestComments.length;
                this.comments.totalItems = this.page * 30 + len + (len === 30 ? 1 : 0);
            }, err => this.alert.httpErrorMessageAlert(err));
    }

}
