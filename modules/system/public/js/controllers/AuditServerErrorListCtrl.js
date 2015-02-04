function AuditServerErrorListCtrl($scope, $controller){
    $scope.api = "/getServerErrors";
    $scope.errorType = "server";
    $controller('AuditErrorListCtrl', {$scope: $scope}); 
}