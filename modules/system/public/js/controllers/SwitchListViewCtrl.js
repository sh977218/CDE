angular.module('systemModule').controller('SwitchListViewCtrl', ['$scope', 'OrgHelpers', 'SearchSettings', function($scope, OrgHelpers, SearchSettings) {

    $scope.maxLines = 5;
    $scope.lineLength = 50;
    if (!$scope.listViewType) {
        if (SearchSettings.getDefaultSearchView()) $scope.listViewType = SearchSettings.getDefaultSearchView();
        else $scope.listViewType = 'accordion';
    }

    $scope.getUsedBy = OrgHelpers.getUsedBy;

    $scope.switchGridAccordionView = function() {
        if ($scope.listViewType === 'accordion') $scope.listViewType = 'table';
        else $scope.listViewType = 'accordion';
    };

    $scope.showSideBySideView = function() {
        if ($scope.cdes.length !== 2) {
            $scope.addAlert("danger", "You may only compare 2 CDEs side by side.");
        } else {
            $scope.listViewType = "sideBySide";
        }
    };

}]);
