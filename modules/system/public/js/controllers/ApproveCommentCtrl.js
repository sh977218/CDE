cdeApp.controller('ApproveCommentCtrl', ['$scope', '$http', 'Mail', function($scope, $http, Mail) {
    $scope.approveComment = function(msg) {
        $http.post('/comments/'+msg.typeCommentApproval.element.eltType+'/approve', msg.typeCommentApproval).
            success(function(data, status, headers, config) {
                $scope.addAlert("success", data);
                $scope.closeMessage(msg);
            }).
            error(function(data, status, headers, config) {
                $scope.addAlert("danger", data);
            });
    };
    
}]);