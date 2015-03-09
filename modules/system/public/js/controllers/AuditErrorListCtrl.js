angular.module('systemModule').controller('AuditErrorListCtrl', ['$scope', '$http', '$q', function($scope, $http, $q) {
    $scope.records = [];
    $scope.skip = 0;
    $scope.limit = 10;
    
    
    
    $scope.promise = null;
    
    $scope.fetchErrors = function(skip, limit){
        $scope.promise = new $q(function(resolve, reject) {
            $scope.resolve = resolve;
        });        
        $http.post($scope.api, {skip: skip, limit: limit}).success(function(result){
            $scope.records = result;
            $scope.resolve();
        });
    };
    $scope.fetchErrors($scope.skip, $scope.limit);
    
    $scope.loadNewer = function(){
        if ($scope.skip>=$scope.limit) $scope.skip -= $scope.limit;
        $scope.fetchErrors($scope.skip, $scope.limit);
    };
    $scope.loadOlder = function(){
        $scope.skip += $scope.limit;
        $scope.fetchErrors($scope.skip, $scope.limit);
    };
    
}]);