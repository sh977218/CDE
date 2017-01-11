angular.module('systemModule').controller('ApproveCommentCtrl', ['$scope', '$http', 'Mail', '$uibModal',
    function($scope, $http, Mail, $modal) {

    $scope.approveComment = function(msg) {
        $http.post('/comments/approve', {
            commentId: msg.typeCommentApproval.comment.commentId,
            replyIndex: msg.typeCommentApproval.comment.replyIndex
        })
            .then(function onSuccess(response) {
                $scope.addAlert("success", response.data);
                $scope.archiveMessage(msg);
            })
            .catch(function onError(response) {
                $scope.addAlert("danger", response.data);
            });
    };
    
    $scope.authorizeUser = function(msg){  
        var request = {username: msg.author.name, role: "CommentAuthor"};
        $http.post('/addUserRole', request)
            .then(function onSuccess(response) {
                $scope.addAlert("success", response.data);
            })
            .catch(function onError(response) {
                $scope.addAlert("danger", response.data);
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
        }).then(function onSuccess(response) {
            $scope.addAlert("success", response.data);
            $scope.archiveMessage(msg);
        }).catch(function onError(response) {
            $scope.addAlert("danger", response.data);
        });
    };

}]);
