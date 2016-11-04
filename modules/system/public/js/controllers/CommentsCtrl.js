angular.module('systemModule').controller('CommentsCtrl', ['$scope', '$http', 'userResource', 'Alert',
    function ($scope, $http, userResource, Alert) {

        $scope.allOnlineUsers = {};

        $scope.tempReplies = {};

        function loadComments() {
            $http.get('/comments/eltId/' + $scope.getEltId()).then(function(result) {
                $scope.eltComments = result.data;
                $scope.eltComments.forEach(function (comment) {
                    addAvatar(comment.username);
                    if (comment.replies) {
                        comment.replies.forEach(function (r) {
                            addAvatar(r.username);
                        })
                    }
                });
            });
        }

        function updateUserStatus(allOnlineUsers) {
            $scope.allOnlineUsers = allOnlineUsers;
        }

        loadComments();

        $scope.newComment = {};

        var commentSocket = io.connect(window.publicUrl + "/comment");
        commentSocket.emit("room", {
            roomId: $scope.getEltId(),
            username: userResource.user.username
        });
        commentSocket.on("commentUpdated", loadComments);
        commentSocket.on("updateUserStatus", updateUserStatus);
        $scope.$on("$destroy", commentSocket.close);

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
                Alert.addAlert("success", res.data.message);
                $scope.newComment.content = "";
            });
        };

        $scope.removeComment = function (commentId, replyId) {
            $http.post("/comments/" + $scope.getCtrlType() + "/remove", {
                commentId: commentId, replyId: replyId}).then(function (res) {
                Alert.addAlert("success", res.data.message);
                loadComments();
            });
        };

        $scope.updateCommentStatus = function (commentId, status) {
            $http.post("/comments/status/" + status, {commentId: commentId}).then(function (res) {
                Alert.addAlert("success", res.data.message);
                loadComments();
            });
        };
        $scope.updateReplyStatus = function (commentId, replyId, status) {
            $http.post("/comments/status/" + status, {commentId: commentId, replyId: replyId}).then(function (res) {
                Alert.addAlert("success", res.data.message);
                loadComments();
            });
        };
        
        $scope.replyTo = function (commentId, reply, showReplies) {
            $http.post("/comments/reply", {
                commentId: commentId,
                eltName: $scope.elt.naming[0].designation,
                eltId: $scope.elt.tinyId,
                reply: reply
            }).then(function (res) {
                $scope.addAlert("success", res.data.message);
                loadComments();
                $scope.eltComments.forEach(function (c) {
                    if (c._id === commentId)
                        c.showReplies = showReplies;
                });
            });
        };


    }
]);