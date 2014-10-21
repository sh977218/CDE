function FormListCtrl($scope, $http, $controller) {
    $scope.module = "form";
    
    $scope.searchForm = {};
    $scope.registrationStatuses = [];
    $scope.searchForm.currentPage = 1;
    $controller('ListCtrl', {$scope: $scope});        

}