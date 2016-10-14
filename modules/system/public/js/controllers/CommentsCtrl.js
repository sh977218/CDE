angular.module('systemModule').controller('CommentsCtrl', ['$scope', '$http', 'userResource',
    function ($scope, $http, userResource) {

        $scope.showResolvedComment = true;

        $scope.canRemoveComment = function (comment) {
            return ((userResource.user._id) &&
            (userResource.user._id === comment.user ||
            (userResource.user.orgAdmin.indexOf($scope.elt.stewardOrg.name) > -1) ||
            userResource.user.siteAdmin ) );
        };
        $scope.canRemoveReply = function (comment, reply) {
            return ((userResource.user._id) &&
            (userResource.user._id === reply.user ||
            userResource.user._id === comment.user ||
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
                comment: $scope.comment.content
                , element: {tinyId: $scope.elt.tinyId}
            }).then(function (res) {
                $scope.addAlert("success", res.data.message);
                $scope.elt = res.data.elt;
                if (!$scope.comment)
                    $scope.comment = {};
                $scope.comment.content = "";
            });
        };

        $scope.removeCommentOrReply = function (commentId, replyId) {
            $http.post("/comments/" + $scope.module + "/remove", {
                commentId: commentId,
                replyId: replyId,
                element: {tinyId: $scope.elt.tinyId}
            }).then(function (res) {
                $scope.addAlert("success", res.data.message);
                $scope.elt = res.data.elt;
            });
        };

        $scope.updateCommentStatus = function (commentId, status) {
            $http.post("/comments/" + $scope.module + "/status/", {
                commentId: commentId,
                status: status,
                element: {
                    tinyId: $scope.elt.tinyId
                }
            }).then(function (res) {
                var message = status.trim() === "active" ? "opened. " : "resolved.";
                $scope.addAlert("success", "comment " + message);
                $scope.elt = res.data.elt;
            });
        };


        $scope.replyTo = function (commentId, reply) {
            $http.post("/comments/" + $scope.module + "/reply", {
                commentId: commentId,
                reply: reply
                , element: {tinyId: $scope.elt.tinyId}
            }).then(function (res) {
                $scope.addAlert("success", res.data.message);
                $scope.elt = res.data.elt;
            });
        };

        $scope.enableEditComment = function (comment) {
            comment.editMode = true;
        };
        $scope.cancelEditComment = function (comment) {
            comment.editMode = false;
            $scope.addAlert("warning", "comment edit canceled.");
        };
        $scope.showEditBtn = function (comment) {
            comment.disableBtn = true;
        };
        $scope.hideEditBtn = function (comment) {
            comment.disableBtn = false;
        };

        $scope.saveComment = function (comment) {
            comment.editMode = false;
            $scope.addAlert("success", "comment saved.");
        };
    }
]);