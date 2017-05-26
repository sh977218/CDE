angular.module('systemModule').controller('SearchSettingsCtrl', ['$scope', 'SearchSettings', '$window', '$rootScope',
    function ($scope, SearchSettings, $window, $rootScope) {

        SearchSettings.getPromise().then(function (settings) {
            $scope.searchSettings = settings;
        });
        $scope.saveSettings = function () {
            SearchSettings.saveConfiguration($scope.searchSettings);
            $scope.addAlert("success", "Settings saved!");
            $scope.goBack();
        };
        $scope.cancelSettings = function () {
            $scope.addAlert("warning", "Cancelled...");
            $scope.goBack();
        };
        $scope.loadDefault = function () {
            var defaultSettings = SearchSettings.getDefault();
            Object.keys(defaultSettings).forEach(function (key) {
                $scope.searchSettings[key] = defaultSettings[key];
            });
            $scope.addAlert("info", "Default settings loaded. Press Save to persist them.");
        };
        $scope.goBack = function () {
            $window.history.back();
        };


    }]);
