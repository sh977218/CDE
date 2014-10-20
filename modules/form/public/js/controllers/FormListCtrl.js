function FormListCtrl($scope, $http, $controller) {
    $scope.module = "form";
    
    $scope.searchForm = {};

    $controller('ListCtrl', {$scope: $scope});    
    
    $scope.searchForm.ftsearch = $scope.cache.get($scope.getCacheName("ftsearch"));   
    $scope.currentSearchTerm = $scope.searchForm.ftsearch;    
}