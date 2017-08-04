angular.module('cdeModule').controller('SDCViewCtrl', ['$scope', '$routeParams', function($scope, $routeParams) {
    
    $scope.cdeId = $routeParams.cdeId;

}]);