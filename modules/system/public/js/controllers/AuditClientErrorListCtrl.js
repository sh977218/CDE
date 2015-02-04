function AuditClientErrorListCtrl($scope, $controller){
    $scope.api = "/getClientErrors"; 
    $scope.errorType = "client";
    $scope.fields = ["Date", "Name", "Message", "Stack"];
    $controller('AuditErrorListCtrl', {$scope: $scope}); 
}