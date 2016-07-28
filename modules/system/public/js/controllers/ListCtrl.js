angular.module('systemModule').controller('ListCtrl',
    ['$scope', '$routeParams', '$window', '$uibModal', 'Elastic', 'OrgHelpers', '$http', '$timeout', 'userResource',
        'SearchSettings', 'AutoCompleteResource', '$location', '$route', '$controller', '$log', 'ElasticBoard',
        function ($scope, $routeParams, $window, $modal, Elastic, OrgHelpers, $http, $timeout, userResource,
                  SearchSettings, AutoCompleteResource, $location, $route, $controller, $log, ElasticBoard)

{

    $scope.autocomplete = AutoCompleteResource;
    $scope.filterMode = true;

    $scope.customClasses = "navbar-btn";

    $scope.exporters = {
        json: {id: "jsonExport", display: "JSON Export"},
        xml: {id: "xmlExport", display: "XML Export"}
    };

    if ($route.current.subCtrl) {
        $controller($route.current.subCtrl, {$scope: $scope});
    }

    $scope.initSearch = function() {
        $scope.searchSettings = {
            q: ""
            , page: 1
            , classification: []
            , classificationAlt: []
            , regStatuses: []
            , resultPerPage: $scope.resultPerPage
        };
    };
    $scope.initSearch();

    $scope.currentSearchTerm = $scope.searchSettings.q;

    $scope.altClassificationFilterMode = false;

    $scope.selectedElements = [];
    $scope.selectedElementsAlt = [];

     var focusClassification = function(){
        //any good angular way to do this?
        $('#classif_filter_title').focus(); // jshint ignore:line
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
        if (!$scope.altClassificationFilterMode) {
            $scope.searchSettings.selectedOrgAlt = "";
            $scope.searchSettings.classificationAlt = [];
        }
        doSearch();
        focusClassification();
    };

    $scope.isAllowed = function () {
        return false;
    };

    $scope.getCurrentSelectedOrg = function() {
        return $scope.altClassificationFilterMode?$scope.searchSettings.selectedOrgAlt:$scope.searchSettings.selectedOrg;
    };

    $scope.getCurrentSelectedClassification = function() {
        return $scope.altClassificationFilterMode?$scope.searchSettings.classificationAlt:$scope.searchSettings.classification;
    };

    $scope._alterOrgFiler = function(orgName) {
        var orgToAlter = $scope.altClassificationFilterMode?$scope.searchSettings.selectedOrgAlt:$scope.searchSettings.selectedOrg;
        var classifToAlter = $scope.getCurrentSelectedClassification();

        if (orgToAlter === undefined) {
            if($scope.altClassificationFilterMode) {
                $scope.searchSettings.selectedOrgAlt = orgName;
            } else {
                $scope.searchSettings.selectedOrg = orgName;
            }
        } else {
            if ($scope.altClassificationFilterMode) {
                $scope.searchSettings.selectedOrgAlt = undefined;
            } else {
                $scope.searchSettings.selectedOrg = undefined;
            }
            classifToAlter.length = 0;
        }
        delete $scope.aggregations.groups;
    };

    $scope.alterOrgFilter = function(orgName) {
        $scope._alterOrgFiler(orgName);
        doSearch();
        focusClassification();
    };

    $scope._selectElement = function(e) {
        var classifToSelect = $scope.altClassificationFilterMode ? $scope.searchSettings.classificationAlt : $scope.searchSettings.classification;
        if (classifToSelect.length === 0) {
            classifToSelect.length = 0;
            classifToSelect.push(e);
        } else {
            var i = classifToSelect.indexOf(e);
            if (i > -1) {
                classifToSelect.length = i;
            } else {
                classifToSelect.push(e);
            }
        }
    };

    $scope.selectElement = function(e) {
        $scope._selectElement(e);
        doSearch();
        focusClassification();
    };

    // Create string representation of what status filters are selected
    $scope.getSelectedStatuses = function() {
        if ($scope.searchSettings.regStatuses.length > 0) {
            if ($scope.searchSettings.regStatuses.length === 6) {
                return "All Statuses";
            } else {
                return $scope.searchSettings.regStatuses.join(", ");
            }
        } else {
            return "All Statuses";
        }
    };

    // Create string representation of what classification filters are selected
    $scope.getSelectedClassifications = function() {
        if ($scope.searchSettings.selectedOrg) {
            var result =  $scope.searchSettings.selectedOrg;
            if ($scope.searchSettings.classification.length > 0) {
                result += " > " + $scope.searchSettings.classification.join(" > ");
            }
            return result;
        } else {
            return "All Classifications";
        }
    };

    $scope.getSelectedClassificationsAlt = function () {
        if ($scope.searchSettings.selectedOrgAlt) {
            var result = $scope.searchSettings.selectedOrgAlt;
            if ($scope.searchSettings.classificationAlt.length > 0) {
                result += " > " + $scope.searchSettings.classificationAlt.join(" > ");
            }
            return result;
        } else {
            return "All Classifications";
        }
    };

    $scope.reload = function(type) {
        userResource.getPromise().then(function () {
            reload(type);
        });
    };

    var reload = function (type) {
        if (!type) type = "cde";

        var timestamp = new Date().getTime();
        $scope.lastQueryTimeStamp = timestamp;
        $scope.accordionListStyle = "semi-transparent";
        var settings = Elastic.buildElasticQuerySettings($scope.searchSettings);

        $log.debug("running query");
        $log.debug(settings);
        Elastic.generalSearchQuery(settings, type, function (err, result) {
            $log.debug("query complete");
            $log.debug(result);
            if (err) {
                $scope.accordionListStyle = "";
                $scope.addAlert("danger", "There was a problem with your query");
                $scope[type + 's'] = [];
                return;
            }
            if (timestamp < $scope.lastQueryTimeStamp) return;
            $scope.numPages = Math.ceil(result.totalNumber / $scope.resultPerPage);
            $scope.totalItems = result.totalNumber;
            $scope[type + 's'] = result[type + 's'];
            $scope.elts = result[type + 's'];
            $scope.took = result.took;

            if ($scope.searchSettings.page === 1 && result.totalNumber > 0) {
                var maxJump = 0;
                var maxJumpIndex = 100;
                $scope.elts.map(function(e, i) {
                    if (!$scope.elts[i+1]) return;
                    var jump = e.score - $scope.elts[i+1].score;
                    if (jump>maxJump) {
                        maxJump = jump;
                        maxJumpIndex = i+1;
                    }
                });

                if (maxJump > (result.maxScore/4)) $scope.cutoffIndex = maxJumpIndex;
                else $scope.cutoffIndex = 100;
            } else {
                $scope.cutoffIndex = 100;
            }

            $scope[type + 's'].forEach(function (elt) {
                elt.usedBy = OrgHelpers.getUsedBy(elt, userResource.user);
            });
            $scope.accordionListStyle = "";
            $scope.openCloseAll($scope[type + 's'], "list");
            $scope.aggregations = result.aggregations;

            if (result.aggregations !== undefined && result.aggregations.flatClassifications !== undefined) {
                $scope.aggregations.flatClassifications = result.aggregations.flatClassifications.flatClassifications.buckets.map(function (c) {
                    return {name: c.key.split(';').pop(), count: c.doc_count};
                });
            } else {
                $scope.aggregations.flatClassifications = [];
            }

            if (result.aggregations !== undefined && result.aggregations.flatClassificationsAlt !== undefined) {
                $scope.aggregations.flatClassificationsAlt = result.aggregations.flatClassificationsAlt.flatClassificationsAlt.buckets.map(function (c) {
                    return {name: c.key.split(';').pop(), count: c.doc_count};
                });
            } else {
                $scope.aggregations.flatClassificationsAlt = [];
            }

            filterOutWorkingGroups($scope.aggregations);
            OrgHelpers.addLongNameToOrgs($scope.aggregations.orgs.orgs.buckets, OrgHelpers.orgsDetailedInfo);

            if ((settings.searchTerm && settings.searchTerm.length > 0) || settings.selectedOrg) {
                $scope.selectedMainAreaMode = mainAreaModes.searchResult;
            } else {
                $scope.selectedMainAreaMode = mainAreaModes.welcomeSearch;
                if ($scope.elts.length===1) throw "I have exactly 1 CDE but I see welcome page :(";
            }
        });

    };

    $scope.generateSearchForTerm = function (type) {
        if (!type) type = $scope.module;

        var searchLink = "/" + type + "/search?";
        if ($scope.searchSettings.q) searchLink += "q=" + encodeURIComponent($scope.searchSettings.q);
        if ($scope.searchSettings.regStatuses.length > 0) {
            searchLink += "&regStatuses=" + $scope.searchSettings.regStatuses.join(';');
        }
        if ($scope.searchSettings.selectedOrg) searchLink += "&selectedOrg=" + encodeURIComponent($scope.searchSettings.selectedOrg);
        if ($scope.searchSettings.classification && $scope.searchSettings.classification.length > 0) {
            searchLink += "&classification=" + encodeURIComponent($scope.searchSettings.classification.join(';'));
        }
        if ($scope.searchSettings.selectedOrgAlt) searchLink += "&selectedOrgAlt=" + encodeURIComponent($scope.searchSettings.selectedOrgAlt);
        if ($scope.altClassificationFilterMode) {
            if ($scope.searchSettings.classificationAlt && $scope.searchSettings.classificationAlt.length > 0) {
                searchLink += "&classificationAlt=" + encodeURIComponent($scope.searchSettings.classificationAlt.join(';'));
            }
        }
        if ($scope.searchSettings.page)
            searchLink += "&page=" + $scope.searchSettings.page;
        return searchLink;
    };

    var search = function(type) {
        $scope.searchSettings.q = $scope.currentSearchTerm = $routeParams.q;
        $scope.searchSettings.page = $routeParams.page;
        $scope.searchSettings.selectedOrg = $routeParams.selectedOrg;
        $scope.searchSettings.selectedOrgAlt = $routeParams.selectedOrgAlt;
        $scope.altClassificationFilterMode = !!$routeParams.selectedOrgAlt;
        $scope.searchSettings.classification = $routeParams.classification?$routeParams.classification.split(';'):[];
        $scope.searchSettings.classificationAlt = $routeParams.classificationAlt?$routeParams.classificationAlt.split(';'):[];
        $scope.searchSettings.regStatuses = $routeParams.regStatuses?$routeParams.regStatuses.split(';'):[];
        $scope.reload(type);
    };

    $scope.search = function(type) {
        search(type);
    };

    var getPathFromUrl = function(url) {
        var ind = url.indexOf("?");
        if (ind > 1) {
            return url.substr(0, ind);
        } else return url;
    };

    $scope.$on('$locationChangeSuccess', function(evt, newUrl, oldUrl) {
        if (getPathFromUrl(newUrl) === getPathFromUrl(oldUrl)) search($scope.module);
    });

    $scope.termSearch = function() {
        $scope.searchSettings.page = 1;
        $scope.searchSettings.regStatuses = [];
        $scope.searchSettings.classification = [];
        $scope.altClassificationFilterMode = false;
        doSearch();
    };

    $scope.pageChange = function() {
      doSearch();
    };

    var doSearch = function() {
        var loc = $scope.generateSearchForTerm();
        $location.url(loc);
    };

    $scope.addStatusFilter = function(status) {
        var index = $scope.searchSettings.regStatuses.indexOf(status);
        if (index > -1) $scope.searchSettings.regStatuses.splice(index, 1);
        else $scope.searchSettings.regStatuses.push(status);
        doSearch();
    };

    var filterOutWorkingGroups = function(aggregations) {
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
        if (userResource.user.username) {
            var modalInstance = $modal.open({
                animation: false,
                templateUrl: '/cde/public/html/selectBoardModal.html',
                controller: 'SelectBoardModalCtrl',
                resolve: {
                    boards: function () {
                        return $scope.boards;
                    }
                }
            });

            modalInstance.result.then(function (selectedBoard) {
                var filter = {
                    reset: function () {
                        this.tags = [];
                        this.sortBy = 'updatedDate';
                        this.sortDirection = 'desc';
                    },
                    sortBy: '',
                    sortDirection: '',
                    tags: []
                };
                var data = {
                    query: Elastic.buildElasticQuerySettings($scope.searchSettings)
                    , board: selectedBoard
                    , itemType: $scope.module
                };
                data.query.resultPerPage = window.maxPin;
                $http.post('/pinEntireSearchToBoard', data).success(function() {
                    $scope.addAlert("success", "All elements pinned.");
                    ElasticBoard.loadMyBoards(filter);
                }).error(function() {
                    $scope.addAlert("danger", "Not all elements were not pinned!");
                });
            }, function () {
            });
        } else {
            $modal.open({
                animation: false,
                templateUrl: '/system/public/html/ifYouLogInModal.html'
            });
        }
    };

    $scope.getRegStatusHelp = function(key) {
        var result = "";
        regStatusShared.statusList.forEach(function(s) { // jshint ignore:line
            if (s.name === key) result = s.help;
        });
        return result;
    };

    $scope.getRegStatusIndex = function(rg) {
        return regStatusShared.orderedList.indexOf(rg.key);
    };

}]);