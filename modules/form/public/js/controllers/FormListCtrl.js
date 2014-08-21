function FormListCtrl($scope, $http, $controller) {
    $scope.module = "form";
    $controller('ListCtrl', {$scope: $scope});    
}