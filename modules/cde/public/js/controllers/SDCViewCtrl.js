angular.module('cdeModule').controller('SDCViewCtrl', ['$scope', '$routeParams', '$http', function($scope, $routeParams, $http) {
    if ($routeParams.cdeId) {
        $http.get("/sdc/" + $routeParams.cdeId).then(function (result) {
            $scope.sdcCde = result.data;
        });
    } else {
        $http.get("/sdc/" + $routeParams.tinyId + "/" + $routeParams.version).then(function (result) {
            $scope.sdcCde = result.data;
        });
    }
}]);