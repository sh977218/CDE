angular.module('systemModule').controller('ListCtrl',
    ['$scope', '$routeParams', '$window', '$modal', 'Elastic', 'OrgHelpers', '$http', '$timeout', 'userResource',
        'SearchSettings', 'QuickBoard', 'AutoCompleteResource', '$location',
        function ($scope, $routeParams, $window, $modal, Elastic, OrgHelpers, $http, $timeout, userResource,
                  SearchSettings, QuickBoard, AutoCompleteResource, $location) {

    $scope.quickBoard = QuickBoard;
    $scope.filterMode = true;
    $scope.searchSettings = {
        q: ""
        , selectedOrg: ""
        , selectedOrgAlt: ""
        , page: 1
        , classification: []
        , classificationAlt: []
    };

    $scope.currentSearchTerm = $scope.searchSettings.q;

    $scope.altClassificationFilterMode = false;

    if (!$scope.registrationStatuses) {
        SearchSettings.getPromise().then(function(){
            $scope.registrationStatuses = SearchSettings.getUserDefaultStatuses().map(function(a){return {name: a}});
        });
    }

    $scope.selectedElements = [];
    $scope.selectedElementsAlt = [];

    // @TODO replace with routeParams
    //$scope.selectedOrg = $scope.cache.get($scope.getCacheName("selectedOrg"));
    //$scope.selectedElements = $scope.cache.get($scope.getCacheName("selectedElements"));

    //$scope.selectedOrgAlt = $scope.cache.get($scope.getCacheName("selectedOrgAlt"));
    //$scope.selectedElementsAlt = $scope.cache.get($scope.getCacheName("selectedElementsAlt"));

    $scope.getAutoComplete = function (searchTerm) {
        return AutoCompleteResource.getAutoComplete(searchTerm);
    };

    $scope.focusClassification = function(){
        //any good angular way to do this?
        $('#classif_filter_title').focus();
    };

    $timeout(function(){
        if($scope.isScreenSizeXsSm) {
            $scope.filterMode = false;
        }
    },0);

    var mainAreaModes = {
        "searchResult": {
            "url": "/system/public/html/searchResult.html"
            , "showSearchResult": true
        }
        , "welcomeSearch": {
            "url": "/system/public/html/welcomeSearch.html"
            , "ngClass": "container"
        }
    };
    if (!$scope.searchSettings.q) {
        $scope.selectedMainAreaMode = mainAreaModes.welcomeSearch;
    } else {
        $scope.selectedMainAreaMode = mainAreaModes.searchResult;
    }

    $scope.hideShowFilter = function() {
        $scope.filterMode = !$scope.filterMode;
    };

    $scope.$watch('isScreenSizeXsSm', function(isScreenSizeXsSm_new, isScreenSizeXsSm_old) {
        if (isScreenSizeXsSm_new !== isScreenSizeXsSm_old) {
            $scope.filterMode = !isScreenSizeXsSm_new;
        }
    });

    $scope.toggleAltClassificationFilterMode = function() {
        $scope.altClassificationFilterMode = !$scope.altClassificationFilterMode;
        //if ($scope.altClassificationFilterMode === 0) {
        //    $scope.altClassificationFilterMode = 1;
        //} else {
        //    $scope.altClassificationFilterMode = 0;
        //    $scope.classificationFilters[1].org = undefined;
        //    $scope.classificationFilters[1].elements = [];
        //}
        // @TODO replace with redirect
        //$scope.reload();
        $scope.focusClassification();
    };

    // @TODO What's this for?
    //$scope.totalItems = $scope.cache.get($scope.getCacheName("totalItems"));

    $scope.$watch('searchSettings.currentPage', function() {
        if (!$scope.searchSettings.currentPage) return;
        // @TODO replace with redirect
        //$scope.reload();
    });

    userResource.getPromise().then(function(){
        // @TODO Why are we doing this? probably old because of how we built ES query. Remove.
        //$scope.reload()
    });

    $scope.isAllowed = function (cde) {
        return false;
    };


    $scope.alterOrgFilter = function(orgName){
        var thingToAlter = $scope.altClassificationFilterMode?$scope.searchSettings.selectedOrgAlt:$scope.searchSettings.selectedOrg;
        if (thingToAlter === undefined) {
            addOrgFilter(orgName);
        } else {
            removeOrgFilter(orgName);
        }
        delete $scope.aggregations.groups;
        $scope.reload();
        $scope.focusClassification();
    };

    $scope.alterOrgFilter = function(orgName){
        if (thingToAlter === undefined) {
            $scope.searchSettings.selectedOrgAlt = orgName;
        } else {
            $scope.classificationFilters[$scope.altClassificationFilterMode].org = undefined;
            $scope.classificationFilters[$scope.altClassificationFilterMode].elements = [];
        }
        //if ($scope.classificationFilters[$scope.altClassificationFilterMode].org === undefined) {
        //    addOrgFilter(orgName);
        //} else {
        //    removeOrgFilter(orgName);
        //}
        delete $scope.aggregations.groups;
        $scope.reload();
        $scope.focusClassification();
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
        var settings = Elastic.buildElasticQuerySettings($scope.searchSettings);

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
            // @TODO what's this for ?
            //$scope.cache.put($scope.getCacheName("totalItems"), $scope.totalItems);
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

    $scope.generateSearchForTerm = function () {
        var searchLink = "/" + $scope.module + "/search?"
        if ($scope.searchSettings.q) searchLink += "q=" + $scope.searchSettings.q;
        if ($scope.selectedOrg) searchLink += "&selectedOrg=" + $scope.selectedOrg;
        var _selectRegStatuses = $scope.registrationStatuses.filter(function(regStatus) {
            return regStatus.selected;
        });
        if (_selectRegStatuses.length > 0) {
            searchLink += "&regStatuses=" + _selectRegStatuses.map(function(r) {return r.name;}).join(',');
        }
        return searchLink;
    };

    var search = function() {
        $scope.searchSettings.q = $routeParams.q;
        $scope.searchSettings.currentPage = $routeParams.currentPage;
        $scope.searchSettings.selectedOrg = $routeParams.selectedOrg;
        $scope.searchSettings.selectedOrgAlt = $routeParams.selectedOrgAlt;
        $scope.searchSettings.selectedClassification = $routeParams.classification
        $scope.searchSettings.selectedClassificationAlt = $routeParams.classificationAlt
        $scope.currentSearchTerm = $scope.searchSettings.q;
        $scope.searchSettings.selectedStatuses = $routeParams.regStatuses?$routeParams.regStatuses.split(','):[];

        //$scope.registrationStatuses.forEach(function (r) {
        //    r.selected = _selectedStatuses.indexOf(r.name) > -1;
        //});
        $scope.classificationFilters = [{
            org: $scope.selectedOrg
            , elements: $scope.selectedElements
        }, {
            org: $scope.selectedOrgAlt
            , elements: $scope.selectedElementsAlt
        }];
        $scope.reload();
    };

    search();

    $scope.$on('$locationChangeSuccess', function() {
        search();
    });

    $scope.termSearch = function() {
        var loc = $scope.generateSearchForTerm();
        $location.url(loc);
    };

    $scope.addStatusFilter = function(t) {
        t.selected = !t.selected;
        $scope.termSearch();
    };

    $scope.filterOutWorkingGroups = function(aggregations) {
        this.setAggregations = function() {
            aggregations.orgs.buckets = aggregations.orgs.orgs.buckets.filter(function(bucket) {
                return OrgHelpers.showWorkingGroup(bucket.key, userResource.user) || userResource.user.siteAdmin;
            });
            $scope.aggregations = aggregations;
        };
        var filterOutWorkingGroups = this;
        OrgHelpers.deferred.promise.then(function() {
            filterOutWorkingGroups.setAggregations();
        });
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


}]);