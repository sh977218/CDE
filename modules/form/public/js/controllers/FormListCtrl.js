function FormListCtrl($scope, $http, $controller) {
    $scope.module = "form";
    
    $scope.searchForm = {};
    $scope.searchForm.ftsearch = $scope.cache.get("ftsearch"+$scope.module);   
    $scope.currentSearchTerm = $scope.searchForm.ftsearch;
    $controller('ListCtrl', {$scope: $scope});    
}