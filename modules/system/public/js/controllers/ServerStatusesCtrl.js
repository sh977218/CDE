angular.module('systemModule').controller('ServerStatusesCtrl', ['$scope', '$http',
    function($scope, $http) {

    $scope.statuses = [];

    $scope.refreshStatus = function() {
        $http.get("/serverStatuses").then(function (result) {
            $scope.statuses = result.data;
        });
    };

    $scope.sendStop = function(server) {
        $http.get("/stop/" + server.hostname + "/" + server.port).then(function (result) {
            $scope.addAlert("success", "Stop sent.")
        });
    };

    $scope.sendRestart = function(server) {
        $http.get("/restart/" + server.hostname + "/" + server.port).then(function (result) {
            $scope.addAlert("success", "Restart request sent");
        });
    }


    $scope.refreshStatus();

}]);