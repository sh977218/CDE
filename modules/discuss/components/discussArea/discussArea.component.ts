import { Component, EventEmitter, Inject, Input, OnDestroy, OnInit, Output } from "@angular/core";
import { Http } from "@angular/http";
import { Comment } from "../../discuss.model";

import "rxjs/add/operator/map";
import * as io from "socket.io-client";
import { TimerObservable } from "rxjs/observable/TimerObservable";
import { AlertService } from "../../../system/public/components/alert/alert.service";

const tabMap = {
    "general_tab": "general",
    "description_tab": "description",
    "pvs_tab": "pvs",
    "naming_tab": "naming",
    "classification_tab": "classification",
    "concepts_tab": "concepts",
    "referenceDocuments_tab": "referenceDocuments",
    "properties_tab": "properties",
    "ids_tab": "ids",
    "attachments_tab": "attachments",
    "history_tab": "history",
    "derivationRules_tab": "derivationRules",
    "validRules_tab": "validRules"
};

@Component({
    selector: "cde-discuss-area",
    templateUrl: "./discussArea.component.html"
})
export class DiscussAreaComponent implements OnInit, OnDestroy {

    constructor(private http: Http,
                private alert: AlertService,
                @Inject("isAllowedModel") private isAllowedModel,
                @Inject("userResource") public userService) {
    };

    newComment: Comment = new Comment();
    eltComments: Comment[];

    subscriptions: any = {};

    socket = io((<any>window).publicUrl + "/comment");

    tempReplies: any = {};
    avatarUrls: any = {};
    showAllReplies: any = {};

    @Input() public elt: any;
    @Input() public eltId: string;
    @Input() public eltName: string;
    @Input() public selectedElt: string = "";
    @Input() highlightedTabs = [];
    @Output() highlightedTabsChange = new EventEmitter();

    ngOnInit() {
        this.loadComments();
        this.setCurrentTab("general_tab");
        this.socket.emit("room", this.eltId);
        this.socket.on("commentUpdated", () => this.loadComments());
        this.socket.on("userTyping", data => {
            this.eltComments.forEach(c => {
                if (c._id === data.commentId && data.username !== this.userService.user.username) {
                    if (this.subscriptions[c._id]) this.subscriptions[c._id].unsubscribe();
                    c.currentlyReplying = true;
                    this.subscriptions[c._id] = TimerObservable.create(10000)
                        .take(1).subscribe(t => c.currentlyReplying = false);
                }
            });
        });
    };

    ngOnDestroy() {
        this.socket.close();
    }

    loadComments = function (cb?) {
        this.http.get('/comments/eltId/' + this.eltId).map(r => r.json()).subscribe(response => {
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
    };

    addAvatar = function (username) {
        if (username && !this.avatarUrls[username]) {
            this.http.get('/user/avatar/' + username).map(r => r.text()).subscribe(res => {
                this.avatarUrls[username] = res.length > 0 ? res : "/cde/public/assets/img/portrait.png";
            });
        }
    };

    canRemoveComment = (com) => this.isAllowedModel.doesUserOwnElt(this.elt) ||
        (this.userService.user && this.userService.user._id && (this.userService.user._id === com.user));

    canResolveComment = (com) => com.status !== "resolved" && this.canRemoveComment(com);

    canReopenComment = (com) => com.status === "resolved" && this.canRemoveComment(com);

    addComment = function () {
        this.http.post("/comments/" + this.elt.elementType + "/add", {
            comment: this.newComment.text,
            linkedTab: tabMap[this.selectedElt],
            element: {eltId: this.eltId}
        }).map(r => r.json()).subscribe(res => {
            this.newComment.text = "";
            this.loadComments(() => {
                this.alert.addAlert("success", res.message);
            });
        });
    };

    removeComment(commentId, replyId) {
        this.http.post("/comments/" + this.elt.elementType + "/remove", {
            commentId: commentId, replyId: replyId
        }).map(r => r.json()).subscribe(res => this.loadComments(() => this.alert.addAlert("success", res.message)));
    };

    updateCommentStatus(commentId, status) {
        this.http.post("/comments/status/" + status, {commentId: commentId}).map(r => r.json())
            .subscribe((res) => this.loadComments(() => this.alert.addAlert("success", res.message)));
    };

    updateReplyStatus(commentId, replyId, status) {
        this.http.post("/comments/status/" + status, {commentId: commentId, replyId: replyId}).map(r => r.json())
            .subscribe(res => this.loadComments(() => this.alert.addAlert("success", res.message)));
    };

    replyTo(commentId, reply) {
        this.http.post("/comments/reply", {
            commentId: commentId,
            eltName: this.eltName,
            reply: reply
        }).subscribe(() => {
            this.tempReplies[commentId] = '';
            this.loadComments();
        });
    };

    cancelReply = (comment) => this.tempReplies[comment._id] = '';

    changeOnReply = (comment) => this.socket.emit('currentReplying', this.eltId, comment._id);

    setCurrentTab($event) {
        if (this.eltComments)
            this.eltComments.forEach(c => {
                if (c.linkedTab && c.linkedTab === tabMap[$event])
                    c.currentComment = true;
                else c.currentComment = false;
            });
    }
}