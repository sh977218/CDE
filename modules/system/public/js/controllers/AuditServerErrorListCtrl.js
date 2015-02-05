function AuditServerErrorListCtrl($scope, $controller){
    $scope.api = "/getServerErrors";
    $scope.fields = ["Date", "Logger", "Stack", "Request"];
    $scope.errorType = "server";
    $controller('AuditErrorListCtrl', {$scope: $scope}); 
}