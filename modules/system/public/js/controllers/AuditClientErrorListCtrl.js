angular.module('systemModule').controller('AuditClientErrorListCtrl', ['$scope', '$controller', function($scope, $controller) {
    $scope.api = "/getClientErrors"; 
    $scope.errorType = "client";
    $scope.fields = ["Date", "Name", "Message", "Browser", "Stack"];
    $controller('AuditErrorListCtrl', {$scope: $scope});
    $scope.gotoPage(1);
}]);