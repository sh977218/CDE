angular.module('systemModule').controller('ApproveCommentCtrl', ['$scope', '$http', 'Mail', '$uibModal',
    function($scope, $http, Mail, $modal) {

    $scope.approveComment = function(msg) {

        $http.post('/comments/approve', {commentId: msg.typeCommentApproval.comment.commentId}).
            success(function(data, status, headers, config) {
                $scope.addAlert("success", data);
                $scope.closeMessage(msg);
            }).
            error(function(data, status, headers, config) {
                $scope.addAlert("danger", data);
            });
    };
    
    $scope.authorizeUser = function(msg){  
        var request = {username: msg.author.name, role: "CommentAuthor"};
        $http.post('/addUserRole', request)
        .success(function(data, status, headers, config) {
            $scope.addAlert("success", data);            
        })
        .error(function(data, status, headers, config) {
            $scope.addAlert("danger", data);
        });        
    };
    
    $scope.openAuthorizeUserModal = function(message){
        var modalInstance = $modal.open({
            animation: false,
            templateUrl: '/system/public/html/messages/approveUser.html'
            , controller: 'ApproveUserModalCtrl'
        });

        modalInstance.result.then(function () {
            $scope.authorizeUser(message);
        }, function () {
            
        });
    };

    $scope.declineComment = function(msg) {
        $http.post('/comments/decline', msg.typeCommentApproval).
            success(function(data, status, headers, config) {
                $scope.addAlert("success", data);
                $scope.closeMessage(msg);
            }).
            error(function(data, status, headers, config) {
                $scope.addAlert("danger", data);
            });
    };

}]);

angular.module('systemModule').controller('ApproveUserModalCtrl', ['$scope', '$uibModalInstance',
    function ($scope, $modalInstance) {

    $scope.ok = function () {
        $modalInstance.close();
    };
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };
}]);