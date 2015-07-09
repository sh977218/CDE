angular.module('systemModule').controller('ListCtrl',
    ['$scope', '$routeParams', '$window', '$modal', 'Elastic', 'OrgHelpers', '$http', '$timeout', 'userResource', 'SearchSettings', 'QuickBoard',
        function($scope, $routeParams, $window, $modal, Elastic, OrgHelpers, $http, $timeout, userResource, SearchSettings, QuickBoard) {

    $scope.quickBoard = QuickBoard;
    $scope.filterMode = true;

    $scope.focusClassification = function(){
        //any good angular way to do this?
        $('#classif_filter_title').focus();
    };

    $timeout(function(){
        if($scope.isScreenSizeXsSm) {
            $scope.filterMode = false;
        }
    },0);

    if (!$scope.searchForm) $scope.searchForm = {};

    var mainAreaModes = {
        "searchResult": {
            "url": "/system/public/html/searchResult.html"
            , "showSearchResult": true
        }
        , "welcomeSearch": {
            "url": "/system/public/html/welcomeSearch.html"
        }
    };
    $scope.selectedMainAreaMode = mainAreaModes.welcomeSearch;

    $scope.hideShowFilter = function() {
        $scope.filterMode = !$scope.filterMode;
    };

    $scope.$watch('isScreenSizeXsSm', function(isScreenSizeXsSm_new, isScreenSizeXsSm_old) {
        if (isScreenSizeXsSm_new !== isScreenSizeXsSm_old) {
            $scope.filterMode = !isScreenSizeXsSm_new;
        }
    });

    $scope.getCacheName = function(name) {
        return "search." + $scope.module + "." + name;
    };

    if ($scope.cache.get($scope.getCacheName("registrationStatuses"))) {
        $scope.registrationStatuses = $scope.cache.get($scope.getCacheName("registrationStatuses"));
    }
    if (!$scope.registrationStatuses) {
        SearchSettings.getPromise().then(function(){
            $scope.registrationStatuses = SearchSettings.getUserDefaultStatuses().map(function(a){return {name: a}});
        });
    }

    if ($scope.cache.get($scope.getCacheName("ftsearch"))) {
        $scope.searchForm.ftsearch = $scope.cache.get($scope.getCacheName("ftsearch"));
        $scope.currentSearchTerm = $scope.searchForm.ftsearch;
    }

    $scope.altClassificationFilterMode = $scope.cache.get($scope.getCacheName("altClassificationFilterMode"));
    if (!$scope.altClassificationFilterMode) {
        $scope.altClassificationFilterMode = 0;
    }

    $scope.toggleAltClassificationFilterMode = function() {
        if ($scope.altClassificationFilterMode === 0) {
            $scope.altClassificationFilterMode = 1;
        } else {
            $scope.altClassificationFilterMode = 0;
            $scope.classificationFilters[1].org = undefined;
            $scope.classificationFilters[1].elements = [];
        }
        $scope.cache.put($scope.getCacheName("altClassificationFilterMode"), $scope.altClassificationFilterMode);
        $scope.reload();
        $scope.focusClassification();
    };

    $scope.selectedOrg = $scope.cache.get($scope.getCacheName("selectedOrg"));
    $scope.selectedElements = $scope.cache.get($scope.getCacheName("selectedElements"));
    if (!$scope.selectedElements) {
        $scope.selectedElements = [];
    }

    $scope.selectedOrgAlt = $scope.cache.get($scope.getCacheName("selectedOrgAlt"));
    $scope.selectedElementsAlt = $scope.cache.get($scope.getCacheName("selectedElementsAlt"));
            console.log("initializing ListCtrl");
    if (!$scope.selectedElementsAlt) {
        $scope.selectedElementsAlt = [];
    } else {
        //$timeout($scope.toggleAltClassificationFilterMode, 0);
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

    userResource.getPromise().then(function(){
        $scope.search()
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

        delete $scope.classificationFilters[0].org;
        delete $scope.classificationFilters[1].org;
        $scope.classificationFilters[0].elements = [];
        $scope.classificationFilters[1].elements = [];

        $scope.altClassificationFilterMode = 0;
        for (var i in $scope.registrationStatuses) {
            $scope.registrationStatuses[i].selected  = false;
        }
        $scope.cache.remove($scope.getCacheName("selectedOrg"));
        $scope.cache.remove($scope.getCacheName("selectedOrgAlt"));
        $scope.cache.remove($scope.getCacheName("selectedElements"));
        $scope.cache.remove($scope.getCacheName("selectedElementsAlt"));
        $scope.cache.remove($scope.getCacheName("registrationStatuses"));
        $scope.cache.remove($scope.getCacheName("ftsearch"));
        $scope.cache.remove($scope.getCacheName("altClassificationFilterMode"));

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

    //$scope.addOrgFilter = function(orgName) {
    //    if ($scope.classificationFilters[$scope.altClassificationFilterMode].org === undefined) {
    //        if ($scope.altClassificationFilterMode === 0) $scope.cacheOrgFilter(orgName);
    //        else $scope.cacheOrgFilterAlt(orgName);
    //        $scope.classificationFilters[$scope.altClassificationFilterMode].org = orgName;
    //    } else {
    //        if ($scope.altClassificationFilterMode === 0) $scope.removeCacheOrgFilter();
    //        else $scope.removeCacheOrgFilterAlt();
    //        $scope.classificationFilters[$scope.altClassificationFilterMode].org = undefined;
    //        $scope.classificationFilters[$scope.altClassificationFilterMode].elements = [];
    //    }
    //    delete $scope.aggregations.groups;
    //    $scope.reload();
    //    $scope.focusClassification();
    //};


    $scope.alterOrgFilter = function(orgName){
        if ($scope.classificationFilters[$scope.altClassificationFilterMode].org === undefined) {
            addOrgFilter(orgName);
        } else {
            removeOrgFilter(orgName);
        }
        delete $scope.aggregations.groups;
        $scope.reload();
        $scope.focusClassification();
    };

    var addOrgFilter = function(orgName) {
        if ($scope.altClassificationFilterMode === 0) $scope.cacheOrgFilter(orgName);
        else $scope.cacheOrgFilterAlt(orgName);
        $scope.classificationFilters[$scope.altClassificationFilterMode].org = orgName;
    };

    var removeOrgFilter = function(orgName) {
        if ($scope.altClassificationFilterMode === 0) $scope.removeCacheOrgFilter();
        else $scope.removeCacheOrgFilterAlt();
        $scope.classificationFilters[$scope.altClassificationFilterMode].org = undefined;
        $scope.classificationFilters[$scope.altClassificationFilterMode].elements = [];
    };

    $scope.selectElement = function(e) {
        if ($scope.classificationFilters[$scope.altClassificationFilterMode].elements.length === 0) {
            $scope.classificationFilters[$scope.altClassificationFilterMode].elements = [];
            $scope.classificationFilters[$scope.altClassificationFilterMode].elements.push(e);
        } else {
            var i = $scope.classificationFilters[$scope.altClassificationFilterMode].elements.indexOf(e);
            if (i > -1) {
                $scope.classificationFilters[$scope.altClassificationFilterMode].elements.length = i;
            } else {
                $scope.classificationFilters[$scope.altClassificationFilterMode].elements.push(e);
            }
        }
        $scope.cache.put($scope.getCacheName($scope.altClassificationFilterMode===0?"selectedElements":"selectedElementsAlt"), $scope.classificationFilters[$scope.altClassificationFilterMode].elements);
        $scope.reload();
        $scope.focusClassification();
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
        if (!$scope.registrationStatuses) return [];
        var selectedRegStatuses = $scope.registrationStatuses.filter(function(s){
            if(s.selected) return true;
        });
        if (selectedRegStatuses.length === 6) {
            return "All Statuses";
        } else {
            return selectedRegStatuses.map(function(s){return s.name;}).join(", ");
        }
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

    $scope.reload = function() {
        var timestamp = new Date().getTime();
        if (!userResource.user) return;
        $scope.lastQueryTimeStamp = timestamp;
        $scope.accordionListStyle = "semi-transparent";
        var settings = Elastic.buildElasticQuerySettings($scope);

        Elastic.generalSearchQuery(settings, $scope.module,  function(err, result) {
            if (err) {
                $scope.accordionListStyle = "";
                $scope.addAlert("danger", "There was a problem with your query");
                $scope.cdes = [];
                return;
            }
            if(timestamp < $scope.lastQueryTimeStamp) return;
            $scope.numPages = Math.ceil(result.totalNumber / $scope.resultPerPage);
            $scope.cdes = result.cdes;
            $scope.cdes.forEach(function(elt) {elt.usedBy = OrgHelpers.getUsedBy(elt, userResource.user);});
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
                            $scope.registrationStatuses[i].count = $scope.aggregations.statuses.buckets[j].doc_count;
                        }
                    }
                }
            }

            $scope.classifications = {elements: []};

            if (result.aggregations !== undefined && result.aggregations.flatClassification !== undefined) {
                $scope.aggregations.flatClassification = result.aggregations.flatClassification.flatClassification.buckets.map(function (c) {
                    return {name: c.key.split(';').pop(), count: c.doc_count};
                });
            } else {
                $scope.aggregations.flatClassification = [];
            }

            if (result.aggregations !== undefined && result.aggregations.flatClassificationAlt !== undefined) {
                $scope.aggregations.flatClassificationAlt = result.aggregations.flatClassificationAlt.flatClassificationAlt.buckets.map(function (c) {
                    return {name: c.key.split(';').pop(), count: c.doc_count};
                });
            } else {
                $scope.aggregations.flatClassificationAlt = [];
            }

            $scope.filterOutWorkingGroups($scope.aggregations);
            OrgHelpers.addLongNameToOrgs($scope.aggregations.orgs.orgs.buckets, OrgHelpers.orgsDetailedInfo);

            if ((settings.searchTerm && settings.searchTerm.length > 0) || settings.selectedOrg)
                $scope.selectedMainAreaMode = mainAreaModes.searchResult;
            else
                $scope.selectedMainAreaMode = mainAreaModes.welcomeSearch;
        });

    };

    $scope.filterOutWorkingGroups = function(aggregations) {
        this.setAggregations = function() {
            aggregations.orgs.buckets = aggregations.orgs.orgs.buckets.filter(function(bucket) {
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
            var settings = Elastic.buildElasticQuerySettings($scope);
            var data = {
                query: settings
                , board: selectedBoard
                , itemType: $scope.module
            };
            data.query.resultPerPage = window.maxPin;
            $http({method: 'post', url: '/pinEntireSearchToBoard', data: data}).success(function() {
                $scope.addAlert("success", "All elements pinned.");
                $scope.loadMyBoards();
            }).error(function() {
                $scope.addAlert("danger", "Not all elements were not pinned!");
            });
        }, function () {
        });
    };

    if ($routeParams.welcome === "true") {
        $scope.resetSearch();
    }

    $scope.reset = function() {
        $window.location = "#/" + $scope.module + "/search?welcome=true";
    }

}]);