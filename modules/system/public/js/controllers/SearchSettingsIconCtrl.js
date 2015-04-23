angular.module('systemModule').controller('SearchSettingsIconCtrl', ['$scope', 'SearchSettings', '$modal', function($scope, SearchSettings, $modal) {
    $scope.openSearchSettingsModal = function() {
        var modalInstance = $modal.open({
            templateUrl: '/system/public/html/searchSettingsModal.html'
            , controller: 'SearchSettingsModalCtrl'
            , resolve: {
                currentSettings: function () {
                    //var settings = {
                    //    "tableViewFields": {
                    //        "cde": {
                    //            "name": true
                    //            , "naming": true
                    //            , "permissibleValues": true
                    //            , "stewardOrg": false
                    //            , "usedBy": true
                    //            , "registrationStatus": true
                    //            , "administrativeStatus": true
                    //            , "ids": false
                    //        }
                    //    }
                    //};
                    return SearchSettings.getConfiguration();
                }
            }
        });

        modalInstance.result.then(function (settings) {
            SearchSettings.saveConfiguration(settings);
        }, function () {

        });
    };
}]);
