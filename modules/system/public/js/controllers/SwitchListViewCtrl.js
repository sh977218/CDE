angular.module('systemModule').controller('SwitchListViewCtrl',
    ['$scope', '$location', '$window', '$timeout', 'OrgHelpers', 'SearchSettings', 'QuickBoard', 'FormQuickBoard', 'localStorageService', 'AlertService',
        function ($scope, $location, $window, $timeout, OrgHelpers, SearchSettings, QuickBoard, FormQuickBoard, localStorageService, Alert) {

            $scope.setViewTypes = function (module) {
                $scope.viewTypes = {
                    accordion: {
                        url: '/' + module + '/public/html/' + module + 'AccordionList.html'
                    }, table: {
                        url: '/' + module + '/public/html/' + module + 'GridList.html'
                    }, sideBySide: {
                        url: '/system/public/html/eltsCompare.html'
                    }, summary: {
                        url: "/" + module + "/public/html/" + module + "SummaryList.html"
                    }
                };
            };

            $scope.setViewTypes($scope.module);

            $scope.maxLines = 5;
            $scope.lineLength = 50;

            $scope.$on('$locationChangeStart', function (event, newUrl, oldUrl) {
                var match = /\/(cde|form)\/search\?.*!/.exec(oldUrl);
                if (match)
                    $window.sessionStorage['nlmcde.scroll.' + match[0]] = $(window).scrollTop();
            });
            $window.addEventListener('unload', function () {
                if (/^\/(cde|form)\/search\?.*/.exec($location.url()))
                    $window.sessionStorage['nlmcde.scroll.' + $location.url()] = $(window).scrollTop();
            });
            var previousSpot = $window.sessionStorage['nlmcde.scroll.' + $location.url()];
            if (previousSpot != null)
                waitScroll(3);

            function waitScroll(count) {
                if (count > 0)
                    $timeout(function () {
                        waitScroll(count - 1);
                    }, 0);
                else
                    $window.scrollTo(0, previousSpot);
            }


            var listViewCacheName = $scope.module + "listViewType";
            if ($scope.cache.get(listViewCacheName)) $scope.listViewType = $scope.cache.get(listViewCacheName);
            else if (SearchSettings.getDefaultSearchView()) $scope.listViewType = SearchSettings.getDefaultSearchView();
            $scope.getUsedBy = OrgHelpers.getUsedBy;

            $scope.switchToView = function (viewType) {
                $scope.eltsToCompare = [];
                $scope.listViewType = viewType;
                $scope.cache.put(listViewCacheName, $scope.listViewType);
            };

            $scope.showSideBySideView = function () {
                var qbResource;
                if (localStorageService.get("defaultQuickBoard") === 'cdeQuickBoard') qbResource = QuickBoard;
                if (localStorageService.get("defaultQuickBoard") === 'formQuickBoard') qbResource = FormQuickBoard;
                if (qbResource.elts.length === 2 && Object.keys($scope.eltsToCompareMap).length === 0) {
                    qbResource.elts.forEach(function (a) {
                        $scope.eltsToCompareMap[a.tinyId] = a;
                    });
                }
                $scope.eltsToCompare = [];
                for (var key in $scope.eltsToCompareMap) {
                    $scope.eltsToCompare.push($scope.eltsToCompareMap[key]);
                }
                $scope.eltsToCompare.sort(function (a, b) {

                });
                if ($scope.eltsToCompare.length !== 2) {
                    Alert.addAlert("danger", "You may only compare 2 elements side by side.");
                } else {
                    $scope.listViewType = "sideBySide";
                }
            };

        }]);
