angular.module('systemModule').controller('CommentsCtrl', ['$scope', '$http', 'userResource',
    function ($scope, $http, userResource) {

        function loadComments() {
            $http.get('/comments/tinyId/' + $scope.elt.tinyId).then(function(result) {
                 $scope.eltComments = result.data;
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

        $scope.deferredEltLoaded.promise.then(function () {
            $scope.elt.comments.forEach(function (comment) {
                addAvatar(comment.userName);
                if (comment.replies) {
                    comment.replies.forEach(function (r) {
                        addAvatar(r.username);
                    })
                }
            });
        });
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
            $http.post("/comments/" + $scope.module + "/add", {
                comment: $scope.newComment.content,
                element: {tinyId: $scope.elt.tinyId}
            }).then(function (res) {
                $scope.addAlert("success", res.data.message);
                loadComments();
                $scope.newComment.content = "";
            });
        };

        $scope.removeComment = function (commentId, replyId) {
            $http.post("/comments/" + $scope.module + "/remove", {commentId: commentId, replyId: replyId}).then(function (res) {
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