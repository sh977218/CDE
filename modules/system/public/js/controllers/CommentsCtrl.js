angular.module('systemModule').controller('CommentsCtrl', ['$scope', '$http', 'userResource',
    function ($scope, $http, userResource) {

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

        $scope.removeComment = function (commentId) {
            $http.post("/comments/" + $scope.module + "/remove", {
                commentId: commentId
                , element: {tinyId: $scope.elt.tinyId}
            }).then(function (res) {
                $scope.addAlert("success", res.data.message);
                $scope.elt = res.data.elt;
            });
        };

        $scope.updateCommentStatus = function (commentId, status) {
            $http.post("/comments/" + $scope.module + "/status/" + status, {
                commentId: commentId
                , element: {tinyId: $scope.elt.tinyId}
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