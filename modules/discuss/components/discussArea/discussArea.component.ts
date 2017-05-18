import { Component, Inject, Input, OnDestroy, OnInit } from "@angular/core";
import { Http } from "@angular/http";
import { Comment } from "../../discuss.model";
import { SocketIoModule, SocketIoConfig, Socket} from 'ng2-socket-io';

import "rxjs/add/operator/map";

@Component({
    selector: "cde-discuss-area",
    templateUrl: "./discussArea.component.html"
})

const config: SocketIoConfig = { url: window.publicUrl + "/comment", options: {} };

export class DiscussAreaComponent implements OnInit, OnDestroy {

    constructor(private http: Http,
                @Inject("Alert") private alert,
                @Inject("userResource") private userService) {};

    newComment: Comment = new Comment();
    eltComments: Comment[];

//     $scope.allOnlineUsers = {};
    
    tempReplies: any = {};
    avatarUrls: any = {};
    showAllReplies: any = {};

    @Input() public elt: any;
    @Input() public eltId: string;
    @Input() public eltName: string;

    @Input() public selectedElt: string;


    ngOnInit () {
        this.loadComments();
    };

    ngOnDestroy () {

    }

    loadComments = function (cb?) {
        this.http.get('/comments/eltId/' + this.eltId).map(r => r.json()).subscribe(response => {
            this.eltComments = response;
            this.eltComments.forEach(comment => {
                if (comment.linkedTab) {
                    // $scope.tabs[comment.linkedTab].highlight = true;
                }
                this.addAvatar(comment.username);
                if (comment.replies) {
                    comment.replies.forEach(r => this.addAvatar(r.username));
                }
            });
            if (cb) cb();
        });
    };

//     var socket = socketIo.connect(window.publicUrl + "/comment");
//     socket.emit("room", $scope.getEltId());
//     socket.on("commentUpdated", loadComments);
//     socket.on("userTyping", function (data) {
//     $scope.eltComments.forEach(function (c) {
//         $timeout.cancel(c.timer);
//         if (c._id === data.commentId && data.username !== userResource.user.username) {
//             c.currentReplying = true;
//             c.timer = $timeout(function () {
//                 c.currentReplying = false;
//             }, 10000);
//         }
//     });
//     $timeout($scope.apply, 0);
// });
//
//     $scope.$on("$destroy", function () {
//     socket.close();
// });
//
    addAvatar = function(username) {
        if (username && !this.avatarUrls[username]) {
            this.http.get('/user/avatar/' + username).map(r => r.text()).subscribe(res => {
                this.avatarUrls[username] = res.length > 0 ? res : "/cde/public/assets/img/portrait.png";
            });
        }
    };

//
//     userResource.getPromise().then(function () {
//     addAvatar(userResource.user.username);
// });
    canRemoveComment = (com) =>  this.userService.doesUserOwnElt(this.elt) ||
        (this.userService.user && this.userService.user._id && (this.userService.user._id === com.user));

    canResolveComment = (com) => com.status !== "resolved" && this.canRemoveComment(com);

    canReopenComment = (com) => com.status === "resolved" && this.canRemoveComment(com);

    addComment = function () {
        this.http.post("/comments/" + this.elt.elementType + "/add", {
            comment: this.newComment.text,
            linkedTab: this.selectedElt,
            element: {eltId: this.eltId}
    }).map(r => r.json()).subscribe(res => {
        this.newComment.content = "";
        this.loadComments(() => {
            this.alert.addAlert("success", res.message);
        });
    });
};

    removeComment (commentId, replyId) {
        this.http.post("/comments/" + this.elt.elementType + "/remove", {
            commentId: commentId, replyId: replyId
        }).map(r => r.json()).subscribe(res => this.loadComments(() => this.alert.addAlert("success", res.message)));
    };

    updateCommentStatus (commentId, status) {
        this.http.post("/comments/status/" + status, {commentId: commentId}).map(r => r.json())
            .subscribe((res) => this.loadComments(() => this.alert.addAlert("success", res.message)));
    };

    updateReplyStatus (commentId, replyId, status) {
        this.http.post("/comments/status/" + status, {commentId: commentId, replyId: replyId}).map(r => r.json())
            .subscribe(res => this.loadComments(() => this.alert.addAlert("success", res.message)));
    };

    replyTo (commentId, reply) {
        this.http.post("/comments/reply", {
            commentId: commentId,
            eltName: this.eltName,
            reply: reply
        }).subscribe(() => {
            this.tempReplies[commentId] = '';
            this.loadComments();
        });
    };
//
//     $scope.cancelReply = function (comment) {
//     $scope.tempReplies[comment._id] = '';
// };
//
//     $scope.changeOnReply = function (comment) {
//     socket.emit('currentReplying', $scope.getEltId(), comment._id);
// };
// }
//
}