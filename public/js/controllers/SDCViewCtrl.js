function SDCViewCtrl($scope, $routeParams, $http) {
    
    var load = function(cdeId, cb) {
        if (cdeId) {
            $http.get("/sdc/" + cdeId).then(function (result) {
                $scope.sdcCde = result.data;
            });
        }
    };
    
    load($routeParams.cdeId);
    
    
};