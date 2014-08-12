function DEListCtrl($rootScope, $scope, $http, $modal, Elastic, OrgHelpers) {
    $scope.setActiveMenu('LISTCDE');

    $scope.registrationStatuses = $scope.cache.get("registrationStatuses");
    if ($scope.registrationStatuses === undefined) {
        $scope.registrationStatuses = regStatusShared.statusList;
    }

    $scope.resultPerPage = 20;

    $scope.ftsearch = $scope.cache.get("ftsearch");
    
    $scope.currentSearchTerm = $scope.ftsearch;

    $scope.selectedOrg = $scope.cache.get("selectedOrg");
    
    $scope.selectedElements = $scope.cache.get("selectedElements");
    if (!$scope.selectedElements) {
        $scope.selectedElements = [];
    }
    
    $scope.totalItems = $scope.cache.get("totalItems");
    
    $scope.currentPage = $scope.cache.get("currentPage");
    
    $scope.$watch('currentPage', function() {
        if (!$scope.currentPage) return;
        $scope.cache.put("currentPage", $scope.currentPage);
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
    
    var fadeList = function(n) { 
        if (document.getElementById("accordionList")) {
            document.getElementById("accordionList").style.opacity = n;
        }
    };

    
    $scope.reload = function() {
        if (!$scope.initialized) return;
        fadeList(.5);
        Elastic.buildElasticQueryPre($scope);
        var settings = Elastic.buildElasticQuerySettings($scope);
        Elastic.buildElasticQuery(settings, function(query) {
            Elastic.generalSearchQuery(query, function(result) {
                $scope.numPages = Math.ceil(result.totalNumber / $scope.resultPerPage); 
                $scope.cdes = result.cdes;
                fadeList(1);
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

    $scope.resetSearch = function() {
        delete $scope.facets;
        $scope.filter = []; 
        delete $scope.ftsearch;
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
        $scope.currentSearchTerm = $scope.ftsearch;
        $scope.cache.put("ftsearch", $scope.ftsearch);
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
