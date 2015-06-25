angular.module('systemModule').controller('SwitchListViewCtrl', ['$scope', 'OrgHelpers', 'SearchSettings',
    function($scope, OrgHelpers, SearchSettings) {

    $scope.listViewType = "accordion";

    $scope.maxLines = 5;
    $scope.lineLength = 50;

    var listViewCacheName = $scope.module + "listViewType";
    if ($scope.cache.get(listViewCacheName)) $scope.listViewType = $scope.cache.get(listViewCacheName);
    else if (SearchSettings.getDefaultSearchView()) $scope.listViewType = SearchSettings.getDefaultSearchView();

    $scope.getUsedBy = OrgHelpers.getUsedBy;

    $scope.switchToTableView = function() {
        switchGridAccordionView("table");
    };

    $scope.switchToAccordionView = function() {
        switchGridAccordionView("accordion");
    };

    var switchGridAccordionView = function(viewType) {
        $scope.listViewType = viewType;
        $scope.cache.put(listViewCacheName, $scope.listViewType);
    };

    $scope.showSideBySideView = function() {
        if ($scope.cdes.length !== 2) {
            $scope.addAlert("danger", "You may only compare 2 CDEs side by side.");
        } else {
            $scope.listViewType = "sideBySide";
        }
    };


    }]);
