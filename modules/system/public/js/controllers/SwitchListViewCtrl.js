angular.module('systemModule').controller('SwitchListViewCtrl', ['$scope', 'OrgHelpers', 'SearchSettings', function($scope, OrgHelpers, SearchSettings) {

    $scope.maxLines = 5;
    $scope.lineLength = 50;
    var listViewCacheName = $scope.module + "listViewType";
    if ($scope.cache.get(listViewCacheName)) $scope.listViewType = $scope.cache.get(listViewCacheName);
    else if (SearchSettings.getDefaultSearchView()) $scope.listViewType = SearchSettings.getDefaultSearchView();
    else $scope.listViewType = "accordion";

    $scope.getUsedBy = OrgHelpers.getUsedBy;

    $scope.switchGridAccordionView = function() {
        if ($scope.listViewType === 'accordion') $scope.listViewType = 'table';
        else $scope.listViewType = 'accordion';
        $scope.cache.put(listViewCacheName, $scope.listViewType);
    };

    $scope.showSideBySideView = function() {
        if ($scope.quickBoard.length !== 2) {
            $scope.addAlert("danger", "You may only compare 2 CDEs side by side.");
        } else {
            $scope.listViewType = "sideBySide";
        }
    };

}]);
