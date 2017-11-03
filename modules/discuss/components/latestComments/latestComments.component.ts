import { Component } from "@angular/core";
import { Http } from "@angular/http";
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: "cde-latest-comments",
    templateUrl: "latestComments.component.html"
})
export class LatestCommentsComponent {

    constructor(private http: Http,
                private route: ActivatedRoute) {
        this.getComments(1);
    }

    comments: any = {currentCommentsPage: 1, totalItems: 10000};

    getComments (page) {
        let commentsUrl = this.route.snapshot.data['commentsUrl'];
        if (!commentsUrl) commentsUrl = '/allComments';
        this.http.get(commentsUrl + "/" + (page - 1) * 30 + "/30").map(r => r.json()).subscribe(result => {
            this.comments.latestComments = result;
            if (this.comments.latestComments.length === 0) {
                this.comments.totalItems = (page - 2) * 30;
            } else if (this.comments.latestComments.length < 30) {
                this.comments.totalItems = (page - 2) * 30 + this.comments.latestComments.length;
            }
        });
    };

    pageChange () {
        this.getComments(this.comments.currentCommentsPage);
    }

    getEltLink (c) {
        return {
            'cde': "/deView?tinyId=",
            'form': "/formView?tinyId=",
            'board': "/board/"
        }[c.element.eltType] + c.element.eltId;
    };
}