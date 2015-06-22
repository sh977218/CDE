angular.module('cdeModule').controller('CdeCopyModalCtrl', ['$scope', 'elt', 'userResource', '$controller', function($scope, elt, userResource,$controller) {
    $scope.elt = elt;
    $scope.origName = $scope.elt.naming[0].designation;
    $scope.myOrgs = userResource.userOrgs;
    $controller('CreateCdeAbstractCtrl', {$scope: $scope});

}]);