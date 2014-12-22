function ListCtrl($scope, $modal, Elastic, OrgHelpers, $rootScope, $http, screenSize, $timeout) {
    $scope.filterMode = true;
    
    $timeout(function(){
        if($scope.isScreenSizeXsSm) {
            $scope.filterMode = false;
        }
    },0);
    

    if (!$scope.searchForm) $scope.searchForm = {};

    $scope.hideShowFilter = function() {
        $scope.filterMode = !$scope.filterMode;
    };
    
    $scope.$watch('isScreenSizeXsSm', function(isScreenSizeXsSm_new, isScreenSizeXsSm_old) {
        if (isScreenSizeXsSm_new !== isScreenSizeXsSm_old) {
            $scope.filterMode = !isScreenSizeXsSm_new;
        }
    });
    
    $scope.query = null;
    
    $scope.getCacheName = function(name) {
        return "search." + $scope.module + "." + name;
    };    

    console.log($scope.cache.get($scope.getCacheName("registrationStatuses")))
    if ($scope.cache.get($scope.getCacheName("registrationStatuses"))) {
        $scope.registrationStatuses = $scope.cache.get($scope.getCacheName("registrationStatuses"));
    }
    if (!$scope.registrationStatuses) {
        $scope.registrationStatuses = JSON.parse(JSON.stringify(regStatusShared.statusList));
        for (var i in $scope.registrationStatuses) {
            $scope.registrationStatuses[i].selected  = ['Standard', 'Preferred Standard', 'Qualified'].indexOf($scope.registrationStatuses[i].name) > -1;
        }
    }   

    if ($scope.cache.get($scope.getCacheName("ftsearch"))) {
        $scope.searchForm.ftsearch = $scope.cache.get($scope.getCacheName("ftsearch")); 
        $scope.currentSearchTerm = $scope.searchForm.ftsearch;   
    }
    
    $scope.altClassificationFilterMode = false;
    $scope.toggleAltClassificationFilterMode = function() {
        $scope.altClassificationFilterMode = !$scope.altClassificationFilterMode;
        
        if(!$scope.altClassificationFilterMode) {
            $scope.selectedOrgAlt = undefined;
            $scope.selectedElementsAlt = [];
        }
        
        $scope.reload();
    };
    
    $scope.selectedOrg = $scope.cache.get($scope.getCacheName("selectedOrg"));    
    $scope.selectedElements = $scope.cache.get($scope.getCacheName("selectedElements"));
    if (!$scope.selectedElements) {
        $scope.selectedElements = [];
    }
    
    $scope.selectedOrgAlt = $scope.cache.get($scope.getCacheName("selectedOrgAlt"));    
    $scope.selectedElementsAlt = $scope.cache.get($scope.getCacheName("selectedElementsAlt"));
    if (!$scope.selectedElementsAlt) {
        $scope.selectedElementsAlt = [];
    }
    
    $scope.totalItems = $scope.cache.get($scope.getCacheName("totalItems"));

    $scope.searchForm.currentPage = $scope.cache.get($scope.getCacheName("currentPage"));
    
    $scope.$watch('searchForm.currentPage', function() {
        if (!$scope.searchForm.currentPage) return;
        $scope.cache.put($scope.getCacheName("currentPage"), $scope.searchForm.currentPage);
        $scope.reload();
    });

    $scope.$watch('userLoaded', function() {
        $scope.reload();        
    });

    
    $scope.addStatusFilter = function(t) {
        t.selected = !t.selected;
        $scope.cache.put($scope.getCacheName("registrationStatuses"), $scope.registrationStatuses);
        $scope.reload();
    }; 

    $scope.resetSearch = function() {
        delete $scope.aggregations;
        delete $scope.filter;
        delete $scope.searchForm.ftsearch;
        delete $scope.selectedOrg;
        delete $scope.selectedOrgAlt;
        $scope.selectedElements = [];
        $scope.selectedElementsAlt = [];
        $scope.altClassificationFilterMode = false;
        for (var i in $scope.registrationStatuses) {
            $scope.registrationStatuses[i].selected  = ['Standard', 'Preferred Standard', 'Qualified'].indexOf($scope.registrationStatuses[i].name) > -1;
        }
        $scope.cache.remove($scope.getCacheName("selectedOrg"));
        $scope.cache.remove($scope.getCacheName("selectedOrgAlt"));
        $scope.cache.remove($scope.getCacheName("selectedElements"));  
        $scope.cache.remove($scope.getCacheName("registrationStatuses"));
        $scope.cache.remove($scope.getCacheName("ftsearch"));   
        
        $scope.currentSearchTerm = null;
        $scope.reload();
    };  

    $scope.search = function() {
        $scope.currentSearchTerm = $scope.searchForm.ftsearch;
        $scope.cache.put($scope.getCacheName("ftsearch"), $scope.searchForm.ftsearch);
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
        if($scope.altClassificationFilterMode) {
            if ($scope.selectedOrgAlt === undefined) {
                $scope.cacheOrgFilterAlt(t.key);
                $scope.selectedOrgAlt = t.key;
            } else {
                $scope.removeCacheOrgFilterAlt();
                delete $scope.selectedOrgAlt;
                $scope.selectedElementsAlt = [];            
            }
        } else {
            if ($scope.selectedOrg === undefined) {
                $scope.cacheOrgFilter(t.key);
                $scope.selectedOrg = t.key;
            } else {
                $scope.removeCacheOrgFilter();
                delete $scope.selectedOrg;
                $scope.selectedElements = [];            
            }
        }
        
        delete $scope.aggregations.groups;
        $scope.reload();
    };

    $scope.selectElement = function(e) {
        if($scope.altClassificationFilterMode) {
            if ($scope.selectedElementsAlt === undefined) {
                $scope.selectedElementsAlt = [];
                $scope.selectedElementsAlt.push(e);
            } else {
                var i = $scope.selectedElementsAlt.indexOf(e);
                if (i > -1) {
                    $scope.selectedElementsAlt.length = i;
                } else {
                    $scope.selectedElementsAlt.push(e);
                }
            }
            $scope.cache.put($scope.getCacheName("selectedElementsAlt"), $scope.selectedElementsAlt);
        } else {
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
        }
        
        $scope.reload();
    };    
    
    $scope.cacheOrgFilter = function(t) {
        $scope.cache.put($scope.getCacheName("selectedOrg"), t);       
    };
    
    $scope.cacheOrgFilterAlt = function(t) {
        $scope.cache.put($scope.getCacheName("selectedOrgAlt"), t);       
    };
    
    $scope.removeCacheOrgFilter = function() {
        $scope.cache.remove($scope.getCacheName("selectedOrg"));
        $scope.cache.remove($scope.getCacheName("selectedElements"));            
    };
    
    $scope.removeCacheOrgFilterAlt = function() {
        $scope.cache.remove($scope.getCacheName("selectedOrgAlt"));
        $scope.cache.remove($scope.getCacheName("selectedElementsAlt"));
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
            result += " > " + $scope.selectedElements.join(" > ");
        }
        return result;
    };
    
    $scope.getSelectedClassificationsAlt = function() {
        var result =  $scope.selectedOrgAlt;
        if ($scope.selectedElementsAlt.length > 0) {
            result += " > " + $scope.selectedElementsAlt.join(" > ");
        }
        return result;
    };
    
    $scope.getUsedBy = function(elt) {
        if (elt.classification)
            return elt.classification.filter(function(c) {return !OrgHelpers.orgIsWorkingGroupOf(c.stewardOrg.name, $scope.orgsDetailedInfo);}).map(function(e) {return e.stewardOrg.name;});
        else return [];
    };
    
    $scope.reload = function() {
        if (!$scope.userLoaded) return;
        $scope.accordionListStyle = "semi-transparent";
        $scope.filter = Elastic.buildElasticQueryPre($scope);
        var settings = Elastic.buildElasticQuerySettings($scope);
        Elastic.buildElasticQuery(settings, function(query) {
            $scope.query = query;
            Elastic.generalSearchQuery(query, $scope.module,  function(result) {
                $scope.numPages = Math.ceil(result.totalNumber / $scope.resultPerPage); 
                $scope.cdes = result.cdes;
                $scope.cdes.forEach(function(elt) {elt.usedBy = $scope.getUsedBy(elt);});
                $scope.accordionListStyle = "";
                $scope.openCloseAll($scope.cdes, "list");
                $scope.totalItems = result.totalNumber;
                $scope.cache.put($scope.getCacheName("totalItems"), $scope.totalItems);
                $scope.aggregations = result.aggregations;
                
                for (var j = 0; j < $scope.registrationStatuses.length; j++) {
                   $scope.registrationStatuses[j].count = 0; 
                }
                if ($scope.aggregations.statuses !== undefined) {
                    for (var i = 0; i < $scope.registrationStatuses.length; i++) {   
                        for (var j = 0; j < $scope.aggregations.statuses.buckets.length; j++) {
                            if ($scope.aggregations.statuses.buckets[j].key === $scope.registrationStatuses[i].name) {
                                $scope.registrationStatuses[i].count = $scope.aggregations.statuses.buckets[j].lowRegStatusOrCurator_filter.doc_count;
                            }
                        }
                    }
                }    
                
                $scope.classifications = {elements: []};
                
                if (result.aggregations !== undefined && result.aggregations.filteredFlatClassification !== undefined) {
                    $scope.aggregations.flatClassification = result.aggregations.filteredFlatClassification.flatClassification.buckets.map(function (c) {
                        return {name: c.key.split(';').pop(), count: c.doc_count};
                    });
                } else {
                    $scope.aggregations.flatClassification = [];
                }
                
                if (result.aggregations !== undefined && result.aggregations.filteredFlatClassificationAlt !== undefined) {
                    $scope.aggregations.flatClassificationAlt = result.aggregations.filteredFlatClassificationAlt.flatClassificationAlt.buckets.map(function (c) {
                        return {name: c.key.split(';').pop(), count: c.doc_count};
                    });
                } else {
                    $scope.aggregations.flatClassificationAlt = [];
                }
                
                $scope.aggregations = $scope.filterOutWorkingGroups($scope.aggregations);
                
                OrgHelpers.addLongNameToOrgs($scope.aggregations.lowRegStatusOrCurator_filter.orgs.buckets, $rootScope.orgsDetailedInfo);
            });
        });  
    };   
    
    $scope.filterOutWorkingGroups = function(aggregations) {
        aggregations.lowRegStatusOrCurator_filter.orgs.buckets = aggregations.lowRegStatusOrCurator_filter.orgs.buckets.filter(function(bucket) {
            var isWorkingGroup = typeof($rootScope.orgsDetailedInfo[bucket.key].workingGroupOf) === "undefined";
            var userIsWorkingGroupCurator = $scope.myOrgs.indexOf(bucket.key) > -1;
            if (isWorkingGroup) var userIsCuratorOfParentOrg = $scope.myOrgs.indexOf($rootScope.orgsDetailedInfo[bucket.key].workingGroupOf) > -1;
            return isWorkingGroup || userIsWorkingGroupCurator || userIsCuratorOfParentOrg || $scope.user.siteAdmin;
        });
        return aggregations;
    };    


    $scope.showPinAllModal = function() {
        var modalInstance = $modal.open({
          templateUrl: '/cde/public/html/selectBoardModal.html',
          controller: SelectBoardModalCtrl,
          resolve: {
            boards: function () {
              return $scope.boards;
            }
          }
        });

        modalInstance.result.then(function (selectedBoard) {
            var data = {
                query: $scope.query.query
                , board: selectedBoard
                , itemType: $scope.module
            };
            $http({method: 'post', url: '/pinEntireSearchToBoard', data: data}).success(function() {
                $scope.addAlert("success", "Elements classified.");  
            }).error(function() {
                $scope.addAlert("danger", "Elements were not classified completely!");  
            });  
        }, function () {
        });        
    };
}
