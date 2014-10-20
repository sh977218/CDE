function FormListCtrl($scope, $http, $controller) {
    $scope.module = "form";
    
    $scope.searchForm = {};
    $scope.registrationStatuses = [];
    $controller('ListCtrl', {$scope: $scope});        
    $scope.searchForm.ftsearch = $scope.cache.get($scope.getCacheName("ftsearch"));   
    $scope.currentSearchTerm = $scope.searchForm.ftsearch;    
    $scope.registrationStatuses = $scope.cache.get($scope.getCacheName("registrationStatuses"));
    if ($scope.registrationStatuses === undefined) {
        //$scope.registrationStatuses = regStatusShared.statusList;
        $scope.registrationStatuses = JSON.parse(JSON.stringify(regStatusShared.statusList));
    }    
    
    $scope.addStatusFilter = function(t) {
        t.selected = !t.selected;
        $scope.cache.put($scope.getCacheName("registrationStatuses"), $scope.registrationStatuses);
        $scope.reload();
    };       
}