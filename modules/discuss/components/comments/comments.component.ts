import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as io from 'socket.io-client';
import { debounceTime, distinctUntilChanged, map, take } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';
import { Subject } from 'rxjs/Subject';
import { TimerObservable } from 'rxjs/observable/TimerObservable';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { IsAllowedService } from 'core/isAllowed.service';
import { UserService } from '_app/user.service';

@Component({
    selector: 'cde-comments',
    templateUrl: './comments.component.html',
    styles: [`
    .currentComment {
        position: relative;
        left: -50px;
    }
    .outer-arrow{
        border-top: none;
        border-bottom: 24px solid transparent;
        border-left: none;
        border-right: 24px solid #ddd;
        left: -21px;
        top: 0px;
        z-index: -1;
        height: 0;
        position: absolute;
        width: 0;
    }
    .inner-arrow{
        cursor: default;
        border-top: none;
        border-bottom: 26px solid transparent;
        border-left: none;
        border-right: 26px solid #fff;
        left: -18px;
        z-index: 501;
        top: 1px;
        height: 0;
        position: absolute;
        width: 0;
    }
    .strike {
        text-decoration: line-through;
    }
    .commentDiv{
        background-color: white;box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    }
    .commentBox{
        background-color: rgb(245, 245, 245);
    }
    `]
})
export class CommentsComponent implements OnInit, OnDestroy {
    @Input() eltId;
    @Input() eltName;
    @Input() ownElt;

    private _currentTab;
    @Input() set currentTab(t) {
        this._currentTab = t;
        this.comments.forEach(c => {
            c.currentComment = c.linkedTab === t;
        });
    }

    comments: Array<any> = [];
    newReply = {};
    socket = io((<any>window).publicUrl + '/comment');
    subscriptions: any = {};
    private emitCurrentReplying = new Subject<{ _id: string, comment: string }>();

    constructor(private http: HttpClient,
                public dialog: MatDialog,
                public isAllowedModel: IsAllowedService,
                public userService: UserService) {
    }

    ngOnInit() {
        this.loadComments();
        this.socket.emit('room', this.eltId);
        this.socket.on('commentUpdated', () => this.loadComments());
        this.socket.on('userTyping', data => {
            this.comments.forEach(c => {
                if (c._id === data.commentId && this.userService.user && data.username !== this.userService.user.username) {
                    if (this.subscriptions[c._id]) this.subscriptions[c._id].unsubscribe();
                    c.currentlyReplying = true;
                    this.subscriptions[c._id] = TimerObservable.create(10000)
                        .pipe(take(1)).subscribe(() => c.currentlyReplying = false);
                }
            });
        });

        this.emitCurrentReplying.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            map(obj => {
                this.socket.emit('currentReplying', this.eltId, obj._id);
                return of<string[]>([]);
            })
        ).subscribe();

    }

    ngOnDestroy() {
        this.socket.close();
    }

    loadComments() {
        this.http.get<Array<any>>('/comments/eltId/' + this.eltId)
            .subscribe(response => {
                response.forEach(comment => {
                    comment.currentComment = comment.linkedTab === this._currentTab;
                    comment.newReply = {};
                });
                this.comments = response;
            });
    }


    canRemoveComment(com) {
        return this.ownElt || (this.userService.user && this.userService.user._id === com.user.userId);
    }

    canReopenComment(com) {
        return com.status === 'resolved' && this.canRemoveComment(com);
    }

    canResolveComment(com) {
        return com.status !== 'resolved' && this.canRemoveComment(com);
    }


    removeComment(commentId) {
        this.http.post('/comment/status/delete', {commentId: commentId}).subscribe();
    }

    resolveComment(commentId) {
        this.http.post('/comment/status/resolve', {commentId: commentId}).subscribe();
    }

    reopenComment(commentId) {
        this.http.post('/comment/status/active', {commentId: commentId}).subscribe();
    }

    removeReply(replyId) {
        this.http.post('/reply/status/delete', {replyId: replyId}).subscribe();
    }

    resolveReply(replyId) {
        this.http.post('/reply/status/resolve', {replyId: replyId}).subscribe();
    }

    reopenReply(replyId) {
        this.http.post('/reply/status/active', {replyId: replyId}).subscribe();
    }

    replyToComment(comment) {
        this.http.post('/comments/reply', {
            commentId: comment._id,
            eltName: this.eltName,
            reply: comment.newReply.text
        }).subscribe(() => {
            comment.newReply = {};
        });
    }

    cancelReply = comment => comment.newReply = {};

    changeOnReply(comment) {
        this.emitCurrentReplying.next({_id: comment._id, comment: comment.newReply});
    }

    showReply(comment, j) {
        if (comment.showAllReplies) return true;
        else if (j < 2 || j > comment.replies.length - 3) return true;
        else return false;
    }

    showInfo(comment, j) {
        return j === 3 && !comment.showAllReplies && comment.replies.length > 5;
    }
}