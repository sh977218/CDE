angular.module('systemModule').controller('ListCtrl', ['$scope', '$modal', 'Elastic', 'OrgHelpers', '$http', '$timeout', 'userResource', function($scope, $modal, Elastic, OrgHelpers, $http, $timeout, userResource) {
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
    
    $scope.altClassificationFilterMode = 0;

    $scope.toggleAltClassificationFilterMode = function() {
        if ($scope.altClassificationFilterMode === 0) {
            $scope.altClassificationFilterMode = 1;
        } else {
            $scope.altClassificationFilterMode = 0;
            $scope.classificationFilters[1].org = undefined;
            $scope.classificationFilters[1].elements = [];
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
    } else {
        $timeout($scope.toggleAltClassificationFilterMode, 0);
    }

    $scope.classificationFilters = [{
        org: $scope.selectedOrg
        , elements: $scope.selectedElements
    }, {
        org: $scope.selectedOrgAlt
        , elements: $scope.selectedElementsAlt
    }];
    
    $scope.totalItems = $scope.cache.get($scope.getCacheName("totalItems"));

    $scope.searchForm.currentPage = $scope.cache.get($scope.getCacheName("currentPage"));
    
    $scope.$watch('searchForm.currentPage', function() {
        if (!$scope.searchForm.currentPage) return;
        $scope.cache.put($scope.getCacheName("currentPage"), $scope.searchForm.currentPage);
        $scope.reload();
    });

    userResource.getPromise().then(function(){$scope.reload()});
    
    $scope.addStatusFilter = function(t) {
        t.selected = !t.selected;
        $scope.cache.put($scope.getCacheName("registrationStatuses"), $scope.registrationStatuses);
        $scope.reload();
    }; 

    $scope.resetSearch = function() {
        delete $scope.aggregations;
        delete $scope.filter;
        delete $scope.searchForm.ftsearch;

        delete $scope.classificationFilters[0].org;
        delete $scope.classificationFilters[1].org;
        delete $scope.classificationFilters[0].elements;
        delete $scope.classificationFilters[1].elements;


        $scope.altClassificationFilterMode = 0;
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
          controller: 'AddToFormModalCtrl',
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
        if($scope.altClassificationFilterMode===1) {
            if ($scope.classificationFilters[1].org === undefined) {
                $scope.cacheOrgFilterAlt(t.key);
                $scope.classificationFilters[1].org = t.key;
            } else {
                $scope.removeCacheOrgFilterAlt();
                $scope.classificationFilters[1].org = undefined;
                $scope.classificationFilters[1].elements = [];
            }
        } else {
            if ($scope.classificationFilters[0].org === undefined) {
                $scope.cacheOrgFilter(t.key);
                $scope.classificationFilters[0].org = t.key;
            } else {
                $scope.removeCacheOrgFilter();
                $scope.classificationFilters[0].org = undefined;
                $scope.classificationFilters[0].elements = [];
            }
        }
        
        delete $scope.aggregations.groups;
        $scope.reload();
    };

    $scope.selectElement = function(e) {
        if($scope.altClassificationFilterMode===1) {
            if ($scope.classificationFilters[1].elements.length === 0) {
                $scope.classificationFilters[1].elements = [];
                $scope.classificationFilters[1].elements.push(e);
            } else {
                var i = $scope.classificationFilters[1].elements.indexOf(e);
                if (i > -1) {
                    $scope.classificationFilters[1].elements.length(i);
                } else {
                    $scope.classificationFilters[1].elements.push(e);
                }
            }
            $scope.cache.put($scope.getCacheName("selectedElementsAlt"), $scope.classificationFilters[1].elements);
        } else {
            if ($scope.classificationFilters[0].elements.length === 0) {
                $scope.classificationFilters[0].elements = [];
                $scope.classificationFilters[0].elements.push(e);
            } else {
                var i = $scope.classificationFilters[0].elements.indexOf(e);
                if (i > -1) {
                    $scope.classificationFilters[0].elements.length = i;
                } else {
                    $scope.classificationFilters[0].elements.push(e);
                }
            }
            $scope.cache.put($scope.getCacheName("selectedElements"), $scope.classificationFilters[0].elements);
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
        var result =  $scope.classificationFilters[0].org;
        if ($scope.classificationFilters[0].elements.length > 0) {
            result += " > " + $scope.classificationFilters[0].elements.join(" > ");
        }
        return result;
    };
    
    $scope.getSelectedClassificationsAlt = function() {
        var result =  $scope.classificationFilters[1].org;
        if ($scope.classificationFilters[1].elements.length > 0) {
            result += " > " + $scope.classificationFilters[1].elements.join(" > ");
        }
        return result;
    };
    
    $scope.getUsedBy = function(elt) {
        if (elt.classification)
            return elt.classification.filter(function(c) {
                return OrgHelpers.showWorkingGroup(c.stewardOrg.name, userResource.user);
            }).map(function(e) {return e.stewardOrg.name;});
        else return [];
    };
    
    $scope.reload = function() {
        var timestamp = new Date().getTime();
        if (!userResource.user) return;
        $scope.lastQueryTimeStamp = timestamp;        
        $scope.accordionListStyle = "semi-transparent";
        $scope.filter = Elastic.buildElasticQueryPre($scope);
        var settings = Elastic.buildElasticQuerySettings($scope);
        Elastic.buildElasticQuery(settings, function(query) {
            $scope.query = query;
            Elastic.generalSearchQuery(query, $scope.module,  function(err, result) {
                if (err) {
                    $scope.accordionListStyle = "";
                    $scope.addAlert("danger", "There was a problem with your query");
                    $scope.cdes = []; 
                    return;
                }
                if(timestamp < $scope.lastQueryTimeStamp) return;
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
                
                $scope.filterOutWorkingGroups($scope.aggregations);
                OrgHelpers.addLongNameToOrgs($scope.aggregations.lowRegStatusOrCurator_filter.orgs.buckets, OrgHelpers.orgsDetailedInfo);
             });
        });  
    };   
    
    $scope.filterOutWorkingGroups = function(aggregations) {
        this.setAggregations = function() {
            aggregations.lowRegStatusOrCurator_filter.orgs.buckets = aggregations.lowRegStatusOrCurator_filter.orgs.buckets.filter(function(bucket) {
                return OrgHelpers.showWorkingGroup(bucket.key, userResource.user) || userResource.user.siteAdmin;
            });
            $scope.aggregations = aggregations;            
        };
        if (!OrgHelpers.isInitialized()) {
            var filterOutWorkingGroups = this;
            OrgHelpers.getOrgsDetailedInfoAPI(function() {
                filterOutWorkingGroups.setAggregations();
            });
        } 
        this.setAggregations();
    };    


    $scope.showPinAllModal = function() {
        var modalInstance = $modal.open({
          templateUrl: '/cde/public/html/selectBoardModal.html',
          controller: 'SelectBoardModalCtrl',
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
                $scope.addAlert("success", "All elements pinned.");  
            }).error(function() {
                $scope.addAlert("danger", "Not all elements were not pinned!");  
            });  
        }, function () {
        });        
    };
}
]);