angular.module('cdeModule').controller('CdeCopyModalCtrl', ['$scope', 'elt', 'userResource', '$controller', function($scope, elt, userResource,$controller) {
    $scope.elt = elt;
    $scope.myOrgs = userResource.userOrgs;
    $controller('CreateCdeAbstractCtrl', {$scope: $scope});

}]);