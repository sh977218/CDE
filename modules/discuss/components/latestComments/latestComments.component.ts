import { Component, Input, OnInit } from "@angular/core";
import { Http } from "@angular/http";
import "rxjs/add/operator/map";

@Component({
    selector: "cde-latest-comments",
    templateUrl: "latestComments.component.html"
})
export class LatestCommentsComponent implements OnInit {

    constructor(private http: Http) {}

    comments: any = {currentCommentsPage: 1, totalItems: 10000};
    @Input() commentsUrl: string = '/allComments/';

    ngOnInit () {
        this.getComments(1);
    }

    getComments (page) {
        this.http.get(this.commentsUrl + (page - 1) * 30 + "/30").map(r => r.json()).subscribe(result => {
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