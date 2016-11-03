angular.module('systemModule').controller('ApproveCommentCtrl', ['$scope', '$http', 'Mail', '$uibModal',
    function($scope, $http, Mail, $modal) {

    $scope.approveComment = function(msg) {
        $http.post('/comments/approve', {
            commentId: msg.typeCommentApproval.comment.commentId,
            replyIndex: msg.typeCommentApproval.comment.replyIndex
        })
            .success(function(data) {
                $scope.addAlert("success", data);
                $scope.archiveMessage(msg);
            }).
            error(function(data) {
                $scope.addAlert("danger", data);
            });
    };
    
    $scope.authorizeUser = function(msg){  
        var request = {username: msg.author.name, role: "CommentAuthor"};
        $http.post('/addUserRole', request)
            .success(function(data) {
                $scope.addAlert("success", data);
            })
            .error(function(data) {
                $scope.addAlert("danger", data);
            });
    };
    
    $scope.openAuthorizeUserModal = function(message){
         $modal.open({
            animation: false,
            templateUrl: '/system/public/html/messages/approveUser.html'
        }).result.then(function () {
            $scope.authorizeUser(message);
        });
    };

    $scope.declineComment = function(msg) {
        $http.post('/comments/decline', {
            commentId: msg.typeCommentApproval.comment.commentId,
            replyIndex: msg.typeCommentApproval.comment.replyIndex
        }).success(function(data) {
            $scope.addAlert("success", data);
            $scope.archiveMessage(msg);
        }).
        error(function(data) {
            $scope.addAlert("danger", data);
        });
    };

}]);
