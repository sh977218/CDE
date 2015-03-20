angular.module('systemModule').controller('ServerStatusesCtrl', ['$scope', '$http', function($scope, $http) {

    $scope.statuses = [];

    $scope.refreshStatus = function() {
        $http.get("/serverStatuses").then(function (result) {
            $scope.statuses = result.data;
        });
    };

    $scope.refreshStatus();

}]);