angular.module('systemModule').controller('AuditErrorListCtrl', ['$scope', '$http', '$q', function($scope, $http, $q) {
    $scope.records = [];
    var itemsPerPage = 10;    
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
    $scope.fetchErrors(0, itemsPerPage);

    $scope.gotoPage = function(page){
        $scope.fetchErrors(itemsPerPage * (page-1), itemsPerPage);
    };    

    $scope.currentPage = 1;
    
}]);