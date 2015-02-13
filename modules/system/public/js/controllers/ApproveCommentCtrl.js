cdeApp.controller('ApproveCommentCtrl', ['$scope', '$http', function($scope, $http) {
    $scope.approveComment = function(msg) {
        $http.post('/comments/'+msg.element.eltType+'/approve', msg).
            success(function(data, status, headers, config) {
                $scope.addAlert("success", data);
            }).
            error(function(data, status, headers, config) {
                $scope.addAlert("danger", data);
            });
    };
}]);