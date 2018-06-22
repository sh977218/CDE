import { Component, Input, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IsAllowedService } from 'core/isAllowed.service';

@Component({
    selector: 'cde-comments',
    templateUrl: './comments.component.html',
    styles: [``]
})
export class CommentsComponent implements OnInit {
    @Input() eltId;
    comments;
    newReply = {};

    constructor(private http: HttpClient,
                public isAllowedModel: IsAllowedService) {
    }

    ngOnInit() {
        this.http.get('/comments/eltId/' + this.eltId)
            .subscribe(response => {
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

    /*

        canRemoveComment = com => this.isAllowedModel.doesUserOwnElt(this.elt) || (this.userService.user && this.userService.user._id === com.user);
        canReopenComment = (com) => com.status === 'resolved' && this.canRemoveComment(com);
        canResolveComment = (com) => com.status !== 'resolved' && this.canRemoveComment(com);
    */


    updateCommentStatus(commentId, status) {
        this.http.post('/comments/status/' + status, {commentId: commentId}).subscribe();
    }

    resolveCommentStatus(commentId) {
        this.http.post('/comments/status/resolved', {commentId: commentId}).subscribe();
    }

    reopenCommentStatus(commentId) {
        this.http.post('/comments/status/active', {commentId: commentId}).subscribe();
    }

    replyToComment(commentId) {
        /*
                setTimeout(() => {
                    this.http.post('/comments/reply', {
                        commentId: commentId,
                        eltName: this.eltName,
                        reply: this.tempReplies[commentId]
                    }).subscribe(() => {
                        this.tempReplies[commentId] = '';
                    });
                }, 0);
        */

    }


}