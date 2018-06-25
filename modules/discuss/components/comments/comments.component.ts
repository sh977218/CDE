import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as io from 'socket.io-client';
import { debounceTime, distinctUntilChanged, map, take } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';
import { Subject } from 'rxjs/Subject';
import { TimerObservable } from 'rxjs/observable/TimerObservable';

import { IsAllowedService } from 'core/isAllowed.service';
import { UserService } from '_app/user.service';

@Component({
    selector: 'cde-comments',
    templateUrl: './comments.component.html',
    styles: [``]
})
export class CommentsComponent implements OnInit, OnDestroy {
    @Input() eltId;
    @Input() eltName;
    @Input() currentTab;

    comments: Array<any>;
    newReply = {};
    socket = io((<any>window).publicUrl + '/comment');
    subscriptions: any = {};
    private emitCurrentReplying = new Subject<{ _id: string, comment: string }>();

    constructor(private http: HttpClient,
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
                    comment.currentComment = comment.linkedTab === this.currentTab;
                    comment.newReply = {};
                });
                this.comments = response;
            });
    }

    /*

        canRemoveComment = com => this.isAllowedModel.doesUserOwnElt(this.elt) || (this.userService.user && this.userService.user._id === com.user);
        canReopenComment = (com) => com.status === 'resolved' && this.canRemoveComment(com);
        canResolveComment = (com) => com.status !== 'resolved' && this.canRemoveComment(com);
    */


    removeCommentStatus(commentId) {
        this.http.post('/comments/status/deleted', {commentId: commentId}).subscribe();
    }

    resolveCommentStatus(commentId) {
        this.http.post('/comments/status/resolved', {commentId: commentId}).subscribe();
    }

    reopenCommentStatus(commentId) {
        this.http.post('/comments/status/active', {commentId: commentId}).subscribe();
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

}