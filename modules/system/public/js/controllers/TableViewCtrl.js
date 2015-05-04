angular.module('systemModule').controller('TableViewCtrl', ['$scope', 'SearchSettings', function($scope, SearchSettings) {
    SearchSettings.getPromise().then(function(settings){
        $scope.searchSettings = settings;
    });
}]);
