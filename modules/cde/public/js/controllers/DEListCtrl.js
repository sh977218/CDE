function DEListCtrl($scope, $controller) {
    $scope.module = "cde";
    $controller('ListCtrl', {$scope: $scope}); 
}
