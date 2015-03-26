angular.module('systemModule').controller('SwitchListViewCtrl', ['$scope', 'OrgHelpers', function($scope, OrgHelpers) {

    $scope.maxLines = 5;
    $scope.listViewType = 'accordion';

    $scope.getUsedBy = OrgHelpers.getUsedBy;

    $scope.switchGridAccordionView = function() {
        if ($scope.listViewType === 'accordion') $scope.listViewType = 'grid';
        else $scope.listViewType = 'accordion';
    };

}]);
