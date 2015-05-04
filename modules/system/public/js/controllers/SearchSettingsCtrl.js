angular.module('systemModule').controller('SearchSettingsCtrl', ['$scope', 'SearchSettings', '$window', function($scope, SearchSettings, $window) {
    SearchSettings.getPromise().then(function(settings) {$scope.searchSettings = settings;});
    $scope.saveSettings = function() {
        SearchSettings.saveConfiguration($scope.searchSettings);
        $scope.addAlert("success", "Settings saved!");
        $scope.goBack();
    };
    $scope.cancelSettings = function() {
        $scope.addAlert("warning", "Cancelled...");
        $scope.goBack();
    };
    $scope.loadDefault = function() {
        $scope.searchSettings = angular.copy(SearchSettings.getDefault());
        $scope.addAlert("info", "Default settings loaded. Press Save to persist them.");
    };
    $scope.goBack = function() {
        $window.history.back();
    };
}]);
