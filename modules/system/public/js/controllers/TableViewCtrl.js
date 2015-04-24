angular.module('systemModule').controller('TableViewCtrl', ['$scope', 'SearchSettings', function($scope, SearchSettings) {
    $scope.searchSettings = SearchSettings.getConfiguration();
}]);

//angular.module('systemModule').controller('SearchSettingsModalCtrl', ['$scope', '$modalInstance', 'currentSettings', function($scope, $modalInstance, currentSettings) {
//    $scope.settings = currentSettings;
//    $scope.save = function () {
//        $modalInstance.close($scope.settings);
//    };
//
//    $scope.cancel = function () {
//        $modalInstance.dismiss('cancel');
//    };
//}]);
