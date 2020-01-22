import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material';
import { UserService } from '_app/user.service';
import { AlertService } from 'alert/alert.service';
import { IsAllowedService } from 'non-core/isAllowed.service';
import { Subject } from 'rxjs';
import { empty } from 'rxjs';
import { timer } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, take } from 'rxjs/operators';
import { Comment, CommentReply } from 'shared/models.model';
import io from 'socket.io-client';

interface ReplyDraft {
     text?: string;
}

type CommentWithReplyDraft = Comment & {
    newReply: ReplyDraft;
};

type CommentWithShowReplies = Comment & {
    replies: CommentReply[];
    showAllReplies: boolean;
};

@Component({
    selector: 'cde-comments',
    templateUrl: './comments.component.html',
    styles: [`
        .currentComment {
            position: relative;
            left: -50px;
        }

        .outer-arrow {
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

        .inner-arrow {
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

        .commentDiv {
            background-color: white;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        }

        .commentBox {
            background-color: rgb(245, 245, 245);
        }
    `]
})
export class CommentsComponent implements OnInit, OnDestroy {
    @Input() eltId!: string;
    @Input() eltName!: string;
    @Input() ownElt!: boolean;
    @Input() set currentTab(t: string) {
        this._currentTab = t;
        this.comments.forEach(c => {
            c.currentComment = c.linkedTab === t;
        });
    }
    private _currentTab!: string;

    comments: Array<any> = [];
    newReply: CommentReply = new CommentReply();
    // @ts-ignore
    socket = io((window as any).publicUrl + '/comment');
    subscriptions: any = {};
    private emitCurrentReplying = new Subject<{ _id: string, comment: ReplyDraft }>();

    constructor(private http: HttpClient,
                public dialog: MatDialog,
                public isAllowedModel: IsAllowedService,
                public userService: UserService,
                public alertService: AlertService) {
    }

    ngOnInit() {
        this.loadComments();
        this.socket.emit('room', this.eltId);
        this.socket.on('commentUpdated', () => this.loadComments());
        this.socket.on('userTyping', (data: {commentId: string, username: string}) => {
            this.comments.forEach(c => {
                if (c._id === data.commentId && this.userService.user && data.username !== this.userService.user.username) {
                    if (this.subscriptions[c._id]) { this.subscriptions[c._id].unsubscribe(); }
                    c.currentlyReplying = true;
                    this.subscriptions[c._id] = timer(10000)
                        .pipe(take(1)).subscribe(() => c.currentlyReplying = false);
                }
            });
        });

        this.emitCurrentReplying.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            map(obj => {
                this.socket.emit('currentReplying', this.eltId, obj._id);
                return empty();
            })
        ).subscribe();

    }

    ngOnDestroy() {
        this.socket.close();
    }

    loadComments() {
        this.http.get<Array<any>>('/server/discuss/comments/eltId/' + this.eltId)
            .subscribe(res => {
                res.forEach(c => {
                    c.currentComment = c.linkedTab === this._currentTab;
                    c.newReply = {};
                });
                this.comments = res;
            });
    }


    canRemoveComment(comment: Comment) {
        return this.ownElt
            || (this.userService.user && this.userService.user._id === comment.user.userId);
    }

    canReopenComment(comment: Comment) {
        return comment.status === 'resolved' && this.canRemoveComment(comment);
    }

    canResolveComment(comment: Comment) {
        return comment.status !== 'resolved' && this.canRemoveComment(comment);
    }

    removeComment(commentId: string) {
        this.http.post('/server/discuss/deleteComment', {commentId}).subscribe();
    }

    resolveComment(commentId: string) {
        this.http.post('/server/discuss/resolveComment', {commentId}).subscribe();
    }

    reopenComment(commentId: string) {
        this.http.post('/server/discuss/reopenComment', {commentId}).subscribe();
    }

    removeReply(replyId: string) {
        this.http.post('/server/discuss/deleteReply', {replyId}).subscribe();
    }

    resolveReply(replyId: string) {
        this.http.post('/server/discuss/resolveReply', {replyId}).subscribe();
    }

    reopenReply(replyId: string) {
        this.http.post('/server/discuss/reopenReply', {replyId}).subscribe();
    }

    replyToComment(comment: CommentWithReplyDraft) {
        this.http.post('/server/discuss/replyComment', {
            commentId: comment._id,
            eltName: this.eltName,
            reply: comment.newReply.text
        }).subscribe(
            () => comment.newReply = {},
            err => this.alertService.addAlert('danger', err.error)
        );
    }

    cancelReply(comment: CommentWithReplyDraft) {
        comment.newReply = {};
    }

    changeOnReply(comment: CommentWithReplyDraft) {
        this.emitCurrentReplying.next({_id: comment._id, comment: comment.newReply});
    }

    showReply(comment: CommentWithShowReplies, j: number) {
        if (comment.showAllReplies) {
            return true;
        } else {
            return j < 2 || j > comment.replies.length - 3;
        }
    }

    showInfo(comment: CommentWithShowReplies, j: number) {
        return j === 3 && !comment.showAllReplies && comment.replies.length > 5;
    }
}
