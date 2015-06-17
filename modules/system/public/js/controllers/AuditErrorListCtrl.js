angular.module('systemModule').controller('AuditErrorListCtrl', ['$scope', '$http', '$q', function($scope, $http, $q) {
    $scope.records = [];
    var itemsPerPage = 10;    

    $scope.fetchErrors = function(skip, limit, cb){
        $http.post($scope.api, {skip: skip, limit: limit}).success(function(result){
            $scope.records = result;
            if (cb) cb();
        });
    };

    $scope.gotoPage = function(page, cb){
        $scope.fetchErrors(itemsPerPage * (page-1), itemsPerPage, cb);
    };    

    $scope.currentPage = 1;
    
}]);