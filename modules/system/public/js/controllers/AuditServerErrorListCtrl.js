function AuditServerErrorListCtrl($scope, $controller){
    $scope.api = "/getServerErrors";
    $scope.fields = ["Date", "Logger", "Stack", "Details"];
    $scope.errorType = "server";
    $controller('AuditErrorListCtrl', {$scope: $scope}); 
}