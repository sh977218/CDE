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
    
    $scope.selectedOrg = $scope.cache.get($scope.getCacheName("selectedOrg"));    
    $scope.selectedElements = $scope.cache.get($scope.getCacheName("selectedElements"));
    if (!$scope.selectedElements) {
        $scope.selectedElements = [];
    }  
    
    $scope.selectElement = function(e) {        
        if ($scope.selectedElements === undefined) {
            $scope.selectedElements = [];
            $scope.selectedElements.push(e);
        } else {
            var i = $scope.selectedElements.indexOf(e);
            if (i > -1) {
                $scope.selectedElements.length = i;
            } else {
                $scope.selectedElements.push(e);
            }
        }
        $scope.cache.put($scope.getCacheName("selectedElements"), $scope.selectedElements);
        $scope.reload();
    };    
    
    $scope.cacheOrgFilter = function(t) {
        $scope.cache.put($scope.getCacheName("selectedOrg"), t);       
    };
    
    $scope.removeCacheOrgFilter = function() {
        $scope.cache.remove($scope.getCacheName("selectedOrg"));
        $scope.cache.remove($scope.getCacheName("selectedElements"));            
    };      
}