import { Component, Input, OnInit } from "@angular/core";
import { Http, Response } from "@angular/http";

@Component({
    selector: "cde-user-comments",
    templateUrl: "./userComments.component.html"
})
export class UserCommentsComponent implements OnInit {
    @Input() user: any;
    pageSize: Number = 30;
    page: Number = 1;
    comments: any;

    constructor(private http: Http) {
        this.comments = {currentCommentsPage: 1, totalItems: 10000, latestComments: []};
    }

    ngOnInit() {
        this.getComments(1);
    }

    getComments(page) {
        //noinspection TypeScriptValidateTypes
        this.http.get("/commentsFor/" + this.user.username + "/" + (page - 1) * 30 + "/30").map((res: Response) => res.json()).subscribe((data) => {
            this.comments.latestComments = data;
            let len = this.comments.latestComments.length;
            this.comments.totalItems = (page - 1) * 30 + len + (len === 30 ? 1 : 0);
        });
    }

    getEltLink(c) {
        return {
                "cde": "/deview?tinyId=",
                "form": "/formView?tinyId=",
                "board": "/board/"
            }[c.element.eltType] + c.element.eltId;
    }
}
