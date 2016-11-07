angular.module('systemModule').controller('CommentsCtrl', ['$scope', '$http', 'userResource',
    function ($scope, $http, userResource) {

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
                })
            });
        }

        loadComments();

        $scope.newComment = {};

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
                eltName: $scope.getEltName(),
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