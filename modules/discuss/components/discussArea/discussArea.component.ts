import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { debounceTime, distinctUntilChanged, map, take } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';
import { Subject } from 'rxjs/Subject';
import { TimerObservable } from 'rxjs/observable/TimerObservable';
import * as io from 'socket.io-client';

import { UserService } from '_app/user.service';
import { IsAllowedService } from 'core/isAllowed.service';
import { Comment } from 'discuss/discuss.model';

const tabMap = {
    preview_tab: 'preview',
    meshTopic_tab: 'meshTopic',
    general_tab: 'general',
    description_tab: 'description',
    pvs_tab: 'pvs',
    naming_tab: 'naming',
    classification_tab: 'classification',
    concepts_tab: 'concepts',
    referenceDocuments_tab: 'referenceDocuments',
    properties_tab: 'properties',
    ids_tab: 'ids',
    attachments_tab: 'attachments',
    history_tab: 'history',
    rules_tab: 'derivationRules'
};

@Component({
    selector: 'cde-discuss-area',
    templateUrl: './discussArea.component.html',
    styles: [`
    .currentTabComment {
        margin-left: -50px;
    }
    .comment {
        background-color: #f5f5f5;
        direction: ltr;
        position: relative;
        width: 240px;
        border: none;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
        border-radius: 2px;
        margin-bottom: 10px;
    }
    .comment-arrow-outer {
        border-top: none;
        border-bottom: 24px solid transparent;
        border-left: none;
        border-right: 24px solid #ddd;
        left: -25px;
        top: -1px;
        z-index: -1;
        height: 0;
        position: absolute;
        width: 0;
    }
    .comment-arrow-inner {
        cursor: default;
        border-top: none;
        border-bottom: 26px solid transparent;
        border-left: none;
        border-right: 26px solid #fff;
        left: -22px;
        z-index: 501;
        top: 0;
        height: 0;
        position: absolute;
        width: 0;
    }
    .rootComment {
        background-color: #f5f5f5;
        direction: ltr;
        position: relative;
        width: 240px;
        border: none;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        border-radius: 2px;
    }
    .commentBody {
        padding: 8px;
        border-bottom: 1px solid #ddd;
        background: #fff;
        min-height: 36px;
    }
    .commentHeader {
        margin: 0 0 8px 0;
        height: 38px;
        white-space: nowrap;
    }
    .commentMessage {
        word-wrap: break-word;
        color: #333;
        padding: 0;
    }
    .rightSideComments {
        padding: 30px;
        background-color: #f5f5f5;
        box-shadow: inset 10px 0 5px -2px #888;
    }
    .reply {
        border: none;
        border-bottom: 1px solid #e5e5e5;
        padding: 3px 8px 5px 8px;
        zoom: 1;
        background: #f5f5f5;
        position: static;
    }
    .replyInputDiv {
        border: none;
        padding: 8px;
    }
    .replyInputTextarea {
        display: block;
        height: 26px;
        line-height: 1.4;
        -webkit-box-sizing: border-box;
        font-family: Arial, sans-serif;
        font-size: 13px;
        margin: 0;
        overflow-x: hidden;
        overflow-y: hidden;
        outline-width: 0 !important;
        padding: 4px;
        resize: none;
        width: 100%;
        border: 1px solid #c8c8c8;
    }
    .user-online {
        width: 32px;
        height: 6px;
        background-color: rgb(31, 161, 93);
    }
    .user-offline {
        width: 32px;
        height: 6px;
        background-color: #333333;
    }
    .showRepliesButton {
        text-decoration: underline;
        word-wrap: break-word;
        color: #15c;
    }
    .showRepliesButtonDiv {
        border: none;
        border-bottom: 1px solid #e5e5e5;
        padding: 3px 8px 5px 8px;
        zoom: 1;
        background: #f5f5f5;
        position: static;
    }
    .strike {
        text-decoration: line-through;
    }
    `]
})
export class DiscussAreaComponent implements OnInit, OnDestroy {
    @Input() public elt: any;
    @Input() public eltId: string;
    @Input() public eltName: string;
    @Input() public selectedElt: string = '';
    @Input() highlightedTabs = [];
    @Output() highlightedTabsChange = new EventEmitter();
    avatarUrls: any = {};
    cancelReply = comment => this.tempReplies[comment._id] = '';
    canRemoveComment = com => this.isAllowedModel.doesUserOwnElt(this.elt) ||
        (this.userService.user && this.userService.user._id && (this.userService.user._id === com.user))
    canReopenComment = (com) => com.status === 'resolved' && this.canRemoveComment(com);
    canResolveComment = (com) => com.status !== 'resolved' && this.canRemoveComment(com);
    eltComments: Comment[];
    private emitCurrentReplying = new Subject<{ _id: string, comment: string }>();
    newComment: Comment = new Comment();
    showAllReplies: any = {};
    socket = io((<any>window).publicUrl + '/comment');
    subscriptions: any = {};
    tempReplies: any = {};

    ngOnInit() {
        this.loadComments();
        this.setCurrentTab('general_tab');
        this.socket.emit('room', this.eltId);
        this.socket.on('commentUpdated', () => this.loadComments());
        this.socket.on('userTyping', data => {
            this.eltComments.forEach(c => {
                if (c._id === data.commentId && data.username !== this.userService.user.username) {
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
        ).subscribe(() => {
        });
    }

    ngOnDestroy() {
        this.socket.close();
    }

    constructor(
        private http: HttpClient,
        public isAllowedModel: IsAllowedService,
        public userService: UserService
    ) {}

    addAvatar(username) {
        if (username && !this.avatarUrls[username]) {
            this.http.get('/user/avatar/' + username, {responseType: 'text'}).subscribe(res => {
                this.avatarUrls[username] = res.length > 0 ? res : '/cde/public/assets/img/portrait.png';
            });
        }
    }

    addComment() {
        this.http.post('/comments/' + this.elt.elementType + '/add', {
            comment: this.newComment.text,
            linkedTab: tabMap[this.selectedElt],
            element: {eltId: this.eltId}
        }).subscribe(() => {
            this.newComment.text = '';
        });
    }

    changeOnReply(comment) {
        this.emitCurrentReplying.next({_id: comment._id, comment: this.tempReplies[comment._id]});
    }

    loadComments(cb?) {
        this.http.get<Comment[]>('/comments/eltId/' + this.eltId).subscribe(response => {
            this.eltComments = response;
            this.eltComments.forEach(comment => {
                if (comment.linkedTab && this.highlightedTabs.indexOf(comment.linkedTab) === -1) {
                    this.highlightedTabs.push(comment.linkedTab);
                }
                if (this.selectedElt.indexOf(comment.linkedTab) !== -1 || (comment.linkedTab && comment.linkedTab.indexOf(this.selectedElt) !== -1)) {
                    comment.currentComment = true;
                }
                this.addAvatar(comment.username);
                if (comment.replies) {
                    comment.replies.forEach(r => this.addAvatar(r.username));
                }
            });
            this.highlightedTabsChange.emit(this.highlightedTabs);
            if (cb) cb();
        });
    }

    removeComment(commentId, replyId) {
        this.http.post('/comments/' + this.elt.elementType + '/remove', {
            commentId: commentId, replyId: replyId
        }).subscribe();
    }

    replyTo(commentId) {
        setTimeout(() => {
            this.http.post('/comments/reply', {
                commentId: commentId,
                eltName: this.eltName,
                reply: this.tempReplies[commentId]
            }).subscribe(() => {
                this.tempReplies[commentId] = '';
            });
        }, 0);
    }

    setCurrentTab($event) {
        if (this.eltComments) {
            this.eltComments.forEach(c => c.currentComment = !!(c.linkedTab && c.linkedTab === tabMap[$event]));
        }
    }

    updateCommentStatus(commentId, status) {
        this.http.post('/comments/status/' + status, {commentId: commentId}).subscribe();
    }

    updateReplyStatus(commentId, replyId, status) {
        this.http.post('/comments/status/' + status, {commentId: commentId, replyId: replyId}).subscribe();
    }
}
