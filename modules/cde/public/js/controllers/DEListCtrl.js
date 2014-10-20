function DEListCtrl($scope, $controller) {
    $scope.module = "cde"; 
        
    $scope.dragSortableOptions = {
        connectWith: ".dragQuestions",
        helper: "clone",
        appendTo: "body"
    };
    $scope.searchForm = {};
    $controller('ListCtrl', {$scope: $scope}); 
    $scope.searchForm.ftsearch = $scope.cache.get($scope.getCacheName("ftsearch"));    
    $scope.currentSearchTerm = $scope.searchForm.ftsearch;    
}
