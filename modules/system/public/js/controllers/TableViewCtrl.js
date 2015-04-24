angular.module('systemModule').controller('TableViewCtrl', ['$scope', 'SearchSettings', function($scope, SearchSettings) {
    $scope.searchSettings = SearchSettings.getConfiguration();
}]);
