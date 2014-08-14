function DEListCtrl($scope, $rootScope, $http, $controller, Elastic, OrgHelpers) {
    $scope.module = "cde";
    $controller('ListCtrl', {$scope: $scope});
    
    $scope.reload = function() {
        if (!$scope.initialized) return;
        Elastic.buildElasticQueryPre($scope);
        var settings = Elastic.buildElasticQuerySettings($scope);
        Elastic.buildElasticQuery(settings, function(query) {
            Elastic.generalSearchQuery(query, function(result) {
                $scope.numPages = Math.ceil(result.totalNumber / $scope.resultPerPage); 
                $scope.cdes = result.cdes;
                $scope.openCloseAll($scope.cdes, "list");
                $scope.totalItems = result.totalNumber;
                $scope.cache.put("totalItems", $scope.totalItems);
                $scope.facets = result.facets;
                
                for (var j = 0; j < $scope.registrationStatuses.length; j++) {
                   $scope.registrationStatuses[j].count = 0; 
                }
                if ($scope.facets.statuses !== undefined) {
                    for (var i = 0; i < $scope.registrationStatuses.length; i++) {
                        var statusFound = false;
                        for (var j = 0; j < $scope.facets.statuses.terms.length; j++) {
                            if ($scope.facets.statuses.terms[j].term === $scope.registrationStatuses[i].name) {
                                statusFound = true;
                                $scope.registrationStatuses[i].count = $scope.facets.statuses.terms[j].count;
                            }
                        }
                        if (!statusFound) {
                            if ($scope.registrationStatuses[i].selected) {
                                $scope.registrationStatuses[i].selected = false;
                                $scope.reload();
                                return;
                            }
                        }
                    }
                }    
                
                $scope.classifications = {elements: []};

                if ($scope.facets.elements !== undefined) {
                    $http.get("/org/" + $scope.selectedOrg).then(function(response) {
                        var org = response.data;
                        if (org.classifications) {
                            $scope.classifications.elements = $scope.matchFacetsOrgs(org);
                        }
                        
                        $scope.classifications;
                    });
                }
                
                OrgHelpers.addLongNameToOrgs($scope.facets.orgs.terms, $rootScope.orgsLongName);
             });
        });  
    };    
}