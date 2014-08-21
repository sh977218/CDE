function ListCtrl($scope, $modal) {
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

    $scope.$watch('initialized', function() {
        $scope.reload();        
    });

    
    $scope.addStatusFilter = function(t) {
        t.selected = !t.selected;
        $scope.cache.put("registrationStatuses", $scope.registrationStatuses);
        $scope.reload();
    };
    
    $scope.matchFacetsOrgs = function(org) {
        this.match = function(facets, orgClassifs, parent, level) {
            if (facets === undefined || facets.terms === undefined) return;
            facets.terms.forEach(function (term) {
                if (orgClassifs) {
                  orgClassifs.forEach(function (oe3) {
                      if (oe3.name === term.term) {
                          var elt = {name: term.term, count: term.count, elements: [], level: level};
                          facetsMatcher.match($scope.facets["elements"+(level+1)], oe3.elements, elt.elements, level+1);
                          parent.push(elt);
                      }
                  });
                }
            });                     
        };
        
        var result = [];
        var facetsMatcher = this; 
        facetsMatcher.match($scope.facets.elements, org.classifications, result, 1);
        return result;        
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
            $scope.selectedElements.push(e.name);
        } else {
            var i = $scope.selectedElements.indexOf(e.name);
            if (i > -1) {
                $scope.selectedElements.length = i;
            } else {
                $scope.selectedElements.push(e.name);
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
    
}
