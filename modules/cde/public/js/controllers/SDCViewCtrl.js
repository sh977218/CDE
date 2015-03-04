angular.module('cdeModule').controller('SDCViewCtrl', ['$scope', '$routeParams', '$http', function($scope, $routeParams, $http) {
    
    var load = function(cdeId, cb) {
        if (cdeId) {
            $http.get("/sdc/" + cdeId).then(function (result) {
                $scope.sdcCde = result.data;
            });
        }
    };
    
    load($routeParams.cdeId);
    
    
}]);