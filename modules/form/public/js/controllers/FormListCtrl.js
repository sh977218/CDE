function FormListCtrl($scope, $controller) {
    $scope.module = "form";    
    $controller('ListCtrl', {$scope: $scope});
}