angular.module('systemModule').controller('CommentsCtrl', ['$scope', '$http', 'userResource', 'Alert',
    function ($scope, $http, userResource, Alert) {

        function loadComments(cb) {
            $http.get('/comments/eltId/' + $scope.getEltId()).then(function(result) {
                $scope.eltComments = result.data;
                $scope.eltComments.forEach(function (comment) {
                    addAvatar(comment.username);
                    if (comment.replies) {
                        comment.replies.forEach(function (r) {
                            addAvatar(r.username);
                        })
                    }
                })
                if (cb) cb();
            });
        }

        loadComments();

        $scope.newComment = {};
        var socket = io.connect('http://localhost:3001');
        socket.emit('openedDiscussion', {
            user: userResource.user,
            tinyId: $scope.elt.tinyId
        });
        socket.on("commentUpdated", function (message) {
            loadComments(function () {
                Alert.addAlert("success", message);
            });
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
            return ((userResource.user._id) &&
            (userResource.user._id === com.user ||
            (userResource.user.orgAdmin.indexOf($scope.elt.stewardOrg.name) > -1) ||
            userResource.user.siteAdmin ) );
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
                element: {eltId: $scope.getEltId()}
            }).then(function (res) {
                $scope.addAlert("success", res.data.message);
                loadComments();
                $scope.newComment.content = "";
            });
        };

        $scope.removeComment = function (commentId, replyId) {
            $http.post("/comments/" + $scope.getCtrlType() + "/remove", {
                commentId: commentId, replyId: replyId}).then(function (res) {
                $scope.addAlert("success", res.data.message);
                loadComments();
            });
        };

        $scope.updateCommentStatus = function (commentId, status) {
            $http.post("/comments/status/" + status, {commentId: commentId}).then(function (res) {
                $scope.addAlert("success", res.data.message);
                loadComments();
            });
        };
        $scope.updateReplyStatus = function (commentId, replyId, status) {
            $http.post("/comments/status/" + status, {commentId: commentId, replyId: replyId}).then(function (res) {
                $scope.addAlert("success", res.data.message);
                loadComments();
            });
        };
        
        $scope.replyTo = function (commentId, reply, showReplies) {
            $http.post("/comments/reply", {
                commentId: commentId,
                eltName: $scope.elt.naming[0].designation,
                reply: reply
            }).then(function (res) {
                socket.emit("addComment", {
                    user: userResource.user,
                    tinyId: $scope.elt.tinyId,
                    text: reply
                });
                $scope.addAlert("success", res.data.message);
                loadComments();
                $scope.eltComments.forEach(function (c) {
                    if (c._id === commentId)
                        c.showReplies = showReplies;
                });
            });
        };

        $scope.$on("$destroy", function () {
            socket.emit('closedDiscussion', {
                user: userResource.user,
                tinyId: $scope.elt.tinyId
            });
        });
    }
]);