function DEListCtrl($scope, $controller) {
    $scope.module = "cde"; 
        
    $scope.dragSortableOptions = {
        connectWith: ".dragQuestions",
        helper: "clone",
        appendTo: "body"
    };
    $scope.searchForm = {};
    $scope.searchForm.ftsearch = $scope.cache.get("ftsearch"+$scope.module);    
    $scope.currentSearchTerm = $scope.searchForm.ftsearch;
    $controller('ListCtrl', {$scope: $scope}); 
}
