function ListCtrl($scope, $modal, Elastic, OrgHelpers, $rootScope, $http) {

    $scope.registrationStatuses = $scope.cache.get("registrationStatuses");
    if ($scope.registrationStatuses === undefined) {
        $scope.registrationStatuses = regStatusShared.statusList;
    }

    $scope.resultPerPage = 20;
    
    $scope.searchForm = {};

    $scope.searchForm.ftsearch = $scope.cache.get("ftsearch");
    
    $scope.currentSearchTerm = $scope.searchForm.ftsearch;

    $scope.selectedOrg = $scope.cache.get("selectedOrg");
    
    $scope.selectedElements = $scope.cache.get("selectedElements");
    if (!$scope.selectedElements) {
        $scope.selectedElements = [];
    }
    
    $scope.totalItems = $scope.cache.get("totalItems");
    
    $scope.searchForm.currentPage = $scope.cache.get("currentPage");
    
    $scope.$watch('searchForm.currentPage', function() {
        if (!$scope.searchForm.currentPage) return;
        $scope.cache.put("currentPage", $scope.searchForm.currentPage);
        $scope.reload();
    });

    $scope.$watch('userLoaded', function() {
        $scope.reload();        
    });

    
    $scope.addStatusFilter = function(t) {
        t.selected = !t.selected;
        $scope.cache.put("registrationStatuses", $scope.registrationStatuses);
        $scope.reload();
    }; 

    $scope.resetSearch = function() {
        delete $scope.facets;
        $scope.filter = []; 
        delete $scope.searchForm.ftsearch;
        delete $scope.selectedOrg;
        $scope.selectedElements = [];
        for (var i in $scope.registrationStatuses) {
            $scope.registrationStatuses[i].selected = false;
        }
        $scope.cache.removeAll();
        $scope.currentSearchTerm = null;
        $scope.reload();
    };

    $scope.search = function() {
        $scope.currentSearchTerm = $scope.searchForm.ftsearch;
        $scope.cache.put("ftsearch", $scope.searchForm.ftsearch);
        $scope.reload();
        
    };
    
    $scope.isAllowed = function (cde) {
        return false;
    };
    
    $scope.openAddToForm = function (cde) {
        $modal.open({
          templateUrl: 'addToFormModalContent.html',
          controller: AddToFormModalCtrl,
          resolve: {
              cde: function() {
                  return cde;
              }
          }
        });
    };
    
    $scope.isDefaultAttachment = function (item) {
        return item.isDefault;  
    };
    
    $scope.addOrgFilter = function(t) {               
        if ($scope.selectedOrg === undefined) {
            $scope.cacheOrgFilter(t.term);
            $scope.selectedOrg = t.term;
        } else {
            $scope.removeCacheOrgFilter();
            delete $scope.selectedOrg;
            $scope.selectedElements = [];            
        }  
        delete $scope.facets.groups;
        $scope.reload();
    };

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
        $scope.cache.put("selectedElements", $scope.selectedElements);
        $scope.reload();
    };
    
    // Create string representation of what status filters are selected    
    $scope.getSelectedStatuses = function() {
        return $scope.registrationStatuses.filter(function(s){
            if(s.selected) return true;
        }).map(function(s){return s.name;}).join(", ");
    };    
    
    // Create string representation of what classification filters are selected
    $scope.getSelectedClassifications = function() {
        var result =  $scope.selectedOrg;
        if ($scope.selectedElements.length > 0) {
            result += " : " + $scope.selectedElements.join(" : ");
        }
        return result;
    };
    
    
    $scope.reload = function() {
        if (!$scope.userLoaded) return;
        $scope.accordionListStyle = "semi-transparent";
        Elastic.buildElasticQueryPre($scope);
        var settings = Elastic.buildElasticQuerySettings($scope);
        Elastic.buildElasticQuery(settings, function(query) {
            Elastic.generalSearchQuery(query, $scope.module,  function(result) {
                $scope.numPages = Math.ceil(result.totalNumber / $scope.resultPerPage); 
                $scope.cdes = result.cdes;
                $scope.accordionListStyle = "";
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
                
                if (result.aggregations !== undefined) {
                    $scope.aggregations = result.aggregations.flatClassification.buckets.map(function (c) {
                        return {name: c.key.split(';').pop(), count: c.doc_count};
                    });
                } else {
                    $scope.aggregations = [];
                }
                
                OrgHelpers.addLongNameToOrgs($scope.facets.orgs.terms, $rootScope.orgsDetailedInfo);
             });
        });  
    };     

}
