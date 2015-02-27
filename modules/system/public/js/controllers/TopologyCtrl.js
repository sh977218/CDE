systemModule.controller('TopologyCtrl', ['$scope', '$http', function($scope, $http) {

    $scope.textContent = "No Content"

    $scope.rsConf = function() {
        $http.get("/rsConf").then(function(result) {
            $scope.textContent = result.data;
        });
    };

    $scope.rsStatus = function() {
        $http.get("/rsStatus").then(function(result) {
            $scope.textContent = result.data;
        });
    };
    
    $scope.nccsPrimary = function(force) {
        $http.post("/nccsPrimary", {force: force}).then(function(result) {
            $scope.textContent = result.data;
        });
    }; 

    $scope.occsPrimary = function() {
        $http.post("/occsPrimary").then(function(result) {
            $scope.textContent = result.data;
        });
    }; 


}]);