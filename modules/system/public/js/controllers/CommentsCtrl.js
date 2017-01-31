var socketIo = require('../../../../cde/public/assets/js/socket.io');
angular.module('systemModule').controller('CommentsCtrl',
    ['$scope', '$http', '$timeout', 'userResource', 'Alert',
        function ($scope, $http, $timeout, userResource, Alert) {

            $scope.allOnlineUsers = {};

            $scope.tempReplies = {};

            function loadComments(cb) {
                $http.get('/comments/eltId/' + $scope.getEltId()).then(function (response) {
                    $scope.eltComments = response.data;
                    $scope.eltComments.forEach(function (comment) {
                        if (comment.linkedTab) {
                            $scope.tabs[comment.linkedTab].highlight = true;
                        }
                        addAvatar(comment.username);
                        if (comment.replies) {
                            comment.replies.forEach(function (r) {
                                addAvatar(r.username);
                            })
                        }
                    });
                    if (cb)cb();
                }).catch(function onError() {});
            }

            loadComments();

            $scope.newComment = {};

            var socket = socketIo.connect(window.publicUrl + "/comment");
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
                $timeout($scope.apply, 0);
            });

            $scope.$on("$destroy", function () {
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

            $scope.showAllReplies = {};
            $scope.replyTo = function (commentId, reply) {
                $http.post("/comments/reply", {
                    commentId: commentId,
                    eltName: $scope.getEltName(),
                    reply: reply
                }).then(function () {
                    $scope.tempReplies[commentId] = '';
                    loadComments();
                }, function (err) {console.log(err)});
            };

            $scope.cancelReply = function (comment) {
                $scope.tempReplies[comment._id] = '';
            };

            $scope.changeOnReply = function (comment) {
                socket.emit('currentReplying', $scope.getEltId(), comment._id);
            };
        }
    ]);
