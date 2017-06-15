angular.module('systemModule').controller('SearchSettingsCtrl', ['$scope', 'SearchSettings', '$window', 'AlertService',
    function ($scope, SearchSettings, $window, Alert) {

        SearchSettings.getPromise().then(function (settings) {
            $scope.searchSettings = settings;
        });
        $scope.saveSettings = function () {
            SearchSettings.saveConfiguration($scope.searchSettings);
            Alert.addAlert("success", "Settings saved!");
            $scope.goBack();
        };
        $scope.cancelSettings = function () {
            Alert.addAlert("warning", "Cancelled...");
            $scope.goBack();
        };
        $scope.loadDefault = function () {
            var defaultSettings = SearchSettings.getDefault();
            Object.keys(defaultSettings).forEach(function (key) {
                $scope.searchSettings[key] = defaultSettings[key];
            });
            Alert.addAlert("info", "Default settings loaded. Press Save to persist them.");
        };
        $scope.goBack = function () {
            $window.history.back();
        };


    }]);
