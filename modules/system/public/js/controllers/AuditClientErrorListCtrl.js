function AuditClientErrorListCtrl($scope, $controller){
    $scope.api = "/getClientErrors"; 
    $scope.errorType = "client";
    $controller('AuditErrorListCtrl', {$scope: $scope}); 
}