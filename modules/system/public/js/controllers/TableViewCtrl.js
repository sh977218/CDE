angular.module('systemModule').controller('TableViewCtrl', ['$scope', 'SearchConfiguration', function($scope, SearchConfiguration) {
    $scope.searchConfiguration = SearchConfiguration.getConfiguration();
}]);