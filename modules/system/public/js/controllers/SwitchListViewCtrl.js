angular.module('systemModule').controller('SwitchListViewCtrl', ['$scope', 'OrgHelpers', 'SearchSettings',
    function ($scope, OrgHelpers, SearchSettings) {

        $scope.viewTypes = {
            accordion: {
                url: '/' + $scope.module + '/public/html/' + $scope.module + 'AccordionList.html'
            }, table: {
                url : '/' + $scope.module + '/public/html/' + $scope.module + 'GridList.html'
            }, sideBySide: {
                url: '/system/public/html/eltsCompare.html'
            }, summary: {
                url: '/' + $scope.module + '/public/html/' + $scope.module + 'SummaryList.html'
            }
        };

        $scope.maxLines = 5;
        $scope.lineLength = 50;

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
            $scope.eltsToCompare = [];
            for (var key in $scope.eltsToCompareMap) {
                $scope.eltsToCompare.push($scope.eltsToCompareMap[key]);
            }
            $scope.eltsToCompare.sort(function (a, b) {

            });
            if ($scope.eltsToCompare.length !== 2) {
                $scope.addAlert("danger", "You may only compare 2 elements side by side.");
            } else {
                $scope.listViewType = "sideBySide";
            }
        };


    }]);
