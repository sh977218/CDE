import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { UserService } from '_app/user.service';
import { Comment, DiscussionComments } from 'shared/models.model';

@Component({
    selector: 'cde-latest-comments',
    templateUrl: 'latestComments.component.html'
})
export class LatestCommentsComponent {
    comments: DiscussionComments = {currentCommentsPage: 1, totalItems: 10000, latestComments: undefined};
    getEltLink = UserService.getEltLink;

    constructor(private http: HttpClient,
                private route: ActivatedRoute) {
        this.getComments(1);
    }

    getComments(page: number) {
        let commentsUrl = this.route.snapshot.data['commentsUrl'];
        if (!commentsUrl) commentsUrl = '/server/discuss/allComments';
        this.http.get<Comment[]>(commentsUrl + '/' + (page - 1) * 30 + '/31').subscribe(comments => {
            if (comments.length < 31) {
                this.comments.totalItems = (page - 1) * 30 + comments.length;
            } else comments.length = 30;
            this.comments.latestComments = comments;
        });
    }

    pageChange(newPageNb) {
        this.comments.currentCommentsPage = newPageNb.pageIndex + 1;
        this.getComments(this.comments.currentCommentsPage);
    }
}
