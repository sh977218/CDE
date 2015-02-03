function AuditErrorListCtrl($scope, $http){
    $scope.errors = [];
    $scope.skip = 0;
    $scope.limit = 10;
    $scope.fetchErrors = function(skip, limit){
        $http.post("/getErrors", {skip: skip, limit: limit}).success(function(result){
            $scope.errors = result;
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
    
}