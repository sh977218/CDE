import { Component, Input, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Comment } from 'modules/discuss/discuss.model';

@Component({
    selector: 'cde-comments',
    templateUrl: './comments.component.html',
    styles: [``]
})
export class CommentsComponent implements OnInit {
    @Input() eltId;
    comments;

    constructor(private http: HttpClient) {
    }

    ngOnInit() {
        this.http.get<Comment[]>('/comments/eltId/' + this.eltId).subscribe(response => {
            this.comments = response;
/*
            this.comments.forEach(comment => {
                if (comment.linkedTab && this.highlightedTabs.indexOf(comment.linkedTab) === -1) {
                    this.highlightedTabs.push(comment.linkedTab);
                }
                if (this.comments.indexOf(comment.linkedTab) !== -1
                    || (comment.linkedTab && comment.linkedTab.indexOf(this.selectedElt) !== -1)) {
                    comment.currentComment = true;
                }
                this.addAvatar(comment.username);
                if (comment.replies) comment.replies.forEach(r => this.addAvatar(r.username));
            });
            this.highlightedTabsChange.emit(this.highlightedTabs);
            if (cb) cb();
*/
        });
    }

}