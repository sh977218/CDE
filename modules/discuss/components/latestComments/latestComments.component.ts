import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute } from '@angular/router';
import { Comment, DiscussionComments } from 'shared/models.model';
import { uriView } from 'shared/item';

@Component({
    selector: 'cde-latest-comments',
    templateUrl: 'latestComments.component.html',
})
export class LatestCommentsComponent {
    comments: DiscussionComments = { currentCommentsPage: 1, totalItems: 10000, latestComments: [] };

    constructor(private http: HttpClient, private route: ActivatedRoute) {
        this.getComments(1);
    }

    getComments(page: number) {
        let commentsUrl = this.route.snapshot.data.commentsUrl;
        if (!commentsUrl) {
            commentsUrl = '/server/discuss/allComments';
        }
        this.http.get<Comment[]>(commentsUrl + '/' + (page - 1) * 30 + '/31').subscribe(comments => {
            if (comments.length < 31) {
                this.comments.totalItems = (page - 1) * 30 + comments.length;
            } else {
                comments.length = 30;
            }
            this.comments.latestComments = comments;
        });
    }

    pageChange(newPageNb: PageEvent) {
        this.comments.currentCommentsPage = newPageNb.pageIndex + 1;
        this.getComments(this.comments.currentCommentsPage);
    }

    protected readonly uriView = uriView;
}
