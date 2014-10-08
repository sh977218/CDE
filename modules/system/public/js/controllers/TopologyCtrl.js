function TopologyCtrl($scope, $http) {

    $scope.textContent = "No Content"

    $scope.rsConf = function() {
        $http.get("/rsConf").then(function(result) {
            $scope.textContent = JSON.stringify(result.data);
        });
    };

}