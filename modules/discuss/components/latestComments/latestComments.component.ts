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

    getComments(page) {
        let commentsUrl = this.route.snapshot.data['commentsUrl'];
        if (!commentsUrl) commentsUrl = '/server/discuss/allComments';
        this.http.get<Comment[]>(commentsUrl + '/' + (page - 1) * 30 + '/30').subscribe(comments => {
            this.comments.latestComments = comments;
        });
    }

    pageChange(newPageNb) {
        this.comments.currentCommentsPage = newPageNb.pageIndex + 1;
        this.getComments(this.comments.currentCommentsPage);
    }
}
