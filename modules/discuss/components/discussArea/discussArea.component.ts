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
    eltComments: Comment[];
    private emitCurrentReplying = new Subject<{ _id: string, comment: string }>();
    newComment: Comment = new Comment();
    showAllReplies: any = {};
    socket = io((<any>window).publicUrl + '/comment');
    subscriptions: any = {};
    tempReplies: any = {};

    constructor(
        private http: HttpClient,
        public isAllowedModel: IsAllowedService,
        public userService: UserService
    ) {}

    ngOnInit() {
        this.loadComments();
        this.setCurrentTab('general_tab');
        this.socket.emit('room', this.eltId);
        this.socket.on('commentUpdated', () => this.loadComments());
        this.socket.on('userTyping', data => {
            this.eltComments.forEach(c => {
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
        ).subscribe(() => {});
    }

    ngOnDestroy() {
        this.socket.close();
    }

    cancelReply = comment => this.tempReplies[comment._id] = '';
    canRemoveComment = com => this.isAllowedModel.doesUserOwnElt(this.elt) || (this.userService.user && this.userService.user._id === com.user);
    canReopenComment = (com) => com.status === 'resolved' && this.canRemoveComment(com);
    canResolveComment = (com) => com.status !== 'resolved' && this.canRemoveComment(com);

    addAvatar(username) {
        if (username && !this.avatarUrls[username]) {
            this.http.get('/user/avatar/' + username, {responseType: 'text'}).subscribe(res => {
                this.avatarUrls[username] = res.length > 0 ? res : '/cde/public/assets/img/min/portrait.png';
            });
        }
    }

    addComment() {
        this.http.post('/comments/' + this.elt.elementType + '/add', {
            comment: this.newComment.text,
            linkedTab: tabMap[this.selectedElt],
            element: {eltId: this.eltId}
        }).subscribe(() => this.newComment.text = '');
    }

    changeOnReply(comment) {
        this.emitCurrentReplying.next({_id: comment._id, comment: this.tempReplies[comment._id]});
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
