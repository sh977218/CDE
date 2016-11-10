angular.module('systemModule').controller('CommentsCtrl',
    ['$scope', '$http', '$timeout', 'userResource', 'Alert',
        function ($scope, $http, $timeout, userResource, Alert) {

            $scope.allOnlineUsers = {};

            $scope.tempReplies = {};

            function loadComments(cb) {
                $http.get('/comments/eltId/' + $scope.getEltId()).then(function (result) {
                    $scope.eltComments = result.data;
                    $scope.eltComments.forEach(function (comment) {
                        if (comment.linkedTab) {
                            $scope.tabs[comment.linkedTab].highlight = true;
                        }
                        if (comment.linkedTab === $scope.currentTab) {
                            comment.class = 'currentTabComment';
                        }
                        addAvatar(comment.username);
                        if (comment.replies) {
                            comment.replies.forEach(function (r) {
                                addAvatar(r.username);
                            })
                        }
                    });
                    if (cb)cb();
                });
            }

            loadComments();

            $scope.newComment = {};

            var socket = io.connect(window.publicUrl + "/comment");
            socket.emit("room", $scope.getEltId());
            socket.on("commentUpdated", loadComments);
            socket.on("userTyping", function (data) {
                $scope.eltComments.forEach(function (c) {
                    $timeout.cancel(c.timer);
                    if (c._id === data.commentId && data.username !== userResource.user.username) {
                        c.currentReplying = true;
                        c.timer = $timeout(function () {
                            c.currentReplying = false;
                        }, 10000);
                    }
                });
                $scope.$apply();
            });

            $scope.$on("$destroy", function () {
                $(".uib-tab").each(function () {
                    $(this).find('uib-tab-heading').css('background-color', '');
                });
                socket.close();
            });

            $scope.avatarUrls = {};
            function addAvatar(username) {
                if (username && !$scope.avatarUrls[username]) {
                    $http.get('/user/avatar/' + username).then(function (res) {
                        $scope.avatarUrls[username] = res.data.length > 0 ? res.data : "/cde/public/assets/img/portrait.png";
                    });
                }
            }

            userResource.getPromise().then(function () {
                addAvatar(userResource.user.username);
            });
            $scope.canRemoveComment = function (com) {
                return $scope.doesUserOwnElt() || (userResource.user._id && (userResource.user._id === com.user));
            };
            $scope.canResolveComment = function (com) {
                return com.status !== "resolved" && $scope.canRemoveComment(com);
            };
            $scope.canReopenComment = function (com) {
                return com.status === "resolved" && $scope.canRemoveComment(com);
            };

            $scope.addComment = function () {
                $http.post("/comments/" + $scope.getCtrlType() + "/add", {
                    comment: $scope.newComment.content,
                    linkedTab: $scope.currentTab,
                    element: {eltId: $scope.getEltId()}
                }).then(function (res) {
                    $scope.newComment.content = "";
                    loadComments(function () {
                        Alert.addAlert("success", res.data.message);
                    });
                });
            };

            $scope.removeComment = function (commentId, replyId) {
                $http.post("/comments/" + $scope.getCtrlType() + "/remove", {
                    commentId: commentId, replyId: replyId
                }).then(function (res) {
                    loadComments(function () {
                        Alert.addAlert("success", res.data.message);
                    });
                });
            };

            $scope.updateCommentStatus = function (commentId, status) {
                $http.post("/comments/status/" + status, {commentId: commentId}).then(function (res) {
                    loadComments(function () {
                        Alert.addAlert("success", res.data.message);
                    });
                });
            };
            $scope.updateReplyStatus = function (commentId, replyId, status) {
                $http.post("/comments/status/" + status, {commentId: commentId, replyId: replyId}).then(function (res) {
                    loadComments(function () {
                        Alert.addAlert("success", res.data.message);
                    });
                });
            };

            $scope.replyTo = function (commentId, reply, showReplies) {
                $http.post("/comments/reply", {
                    commentId: commentId,
                    eltName: $scope.getEltName(),
                    reply: reply
                }).then(function (res) {
                    $scope.tempReplies[commentId] = '';
                    loadComments(function () {
                        $scope.eltComments.forEach(function (c) {
                            if (c._id === commentId)
                                c.showReplies = showReplies;
                        });
                        $scope.addAlert("success", res.data.message);
                    });
                });
            };

            $scope.cancelReply = function (comment) {
                $scope.tempReplies[comment._id] = '';
                comment.openReply = false;
            };

            $scope.focusOnReply = function (comment) {
                comment.openReply = true;
            };
            $scope.changeOnReply = function (comment) {
                socket.emit('currentReplying', $scope.getEltId(), comment._id);
            };
        }
    ]);
