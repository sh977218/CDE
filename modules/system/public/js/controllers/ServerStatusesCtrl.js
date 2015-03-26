angular.module('systemModule').controller('ServerStatusesCtrl', ['$scope', '$http',
    function($scope, $http) {

    $scope.statuses = [];

    $scope.refreshStatus = function() {
        $http.get("/serverStatuses").then(function (result) {
            $scope.statuses = result.data;
        });
    };
    $scope.getNodeStatus = function(status) {
        if (status.nodeStatus === 'Running' && (new Date().getTime() - new Date(status.lastUpdate).getTime()) > (45 * 1000)) {
            return 'Not Responding';
        }
        return status.nodeStatus;
    };

    $scope.sendStop = function(server) {
        $http.post("/serverState", {hostname: server.hostname, port: server.port, pmPort: server.pmPort, action: "stop"}).then(function (result) {
            $scope.addAlert("success", "Stop sent.")
        });
    };

    $scope.sendRestart = function(server) {
        $http.post("/serverState", {hostname: server.hostname, port: server.port, pmPort: server.pmPort, action: "restart"}).then(function (result) {
            $scope.addAlert("success", "Restart request sent");
        });
    }


    $scope.refreshStatus();

}]);