angular.module('systemModule').controller('TableViewCtrl', ['$scope', 'SearchSettings', function($scope, SearchSettings) {
    //$scope.searchSettings = SearchSettings.getConfiguration();
    SearchSettings.getPromise().then(function(settings){
        $scope.searchSettings = settings;
    });
}]);
