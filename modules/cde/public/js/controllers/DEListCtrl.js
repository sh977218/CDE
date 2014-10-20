function DEListCtrl($scope, $controller) {
    $scope.module = "cde"; 
        
    $scope.dragSortableOptions = {
        connectWith: ".dragQuestions",
        helper: "clone",
        appendTo: "body"
    };
    $scope.searchForm = {};
    $scope.registrationStatuses = [];
    $controller('ListCtrl', {$scope: $scope}); 
    $scope.searchForm.ftsearch = $scope.cache.get($scope.getCacheName("ftsearch"));    
    $scope.currentSearchTerm = $scope.searchForm.ftsearch;   
    
    $scope.registrationStatuses = $scope.cache.get($scope.getCacheName("registrationStatuses"));
    if ($scope.registrationStatuses === undefined) {
        //$scope.registrationStatuses = regStatusShared.statusList.slice();
        $scope.registrationStatuses = JSON.parse(JSON.stringify(regStatusShared.statusList));
    }    
    
    $scope.addStatusFilter = function(t) {
        t.selected = !t.selected;
        $scope.cache.put($scope.getCacheName("registrationStatuses"), $scope.registrationStatuses);
        $scope.reload();
    };     
}
