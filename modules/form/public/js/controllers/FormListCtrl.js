function FormListCtrl($scope, $http, $controller) {
    $scope.module = "form";
    
    $scope.searchForm = {};
    $scope.registrationStatuses = [];
    $controller('ListCtrl', {$scope: $scope});        

}