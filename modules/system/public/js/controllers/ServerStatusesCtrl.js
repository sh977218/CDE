angular.module('systemModule').controller('ServerStatusesCtrl', ['$scope', '$http', '$upload',
    function($scope, $http, $upload) {

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
    };

    $scope.refreshStatus();

    $scope.upload = function (hostname, pmPort, files) {
        if (files && files.length) {
            var file = files[0];
            $upload.upload({
                url: '/deploy',
                fields: {'hostname': hostname, pmPort: pmPort},
                file: file,
                fileFormDataName: "deployFile"
            }).progress(function (evt) {
                $scope.progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            }).success(function (data, status, headers, config) {
                delete $scope.progressPercentage;
                $scope.addAlert("success", "Deployment complete");
            });
        }
    };

}]);