angular.module('systemModule').controller('AuditLogCtrl', ['$scope', '$controller', function($scope, $controller) {
    $scope.api = "/getCdeAuditLog"; 
    $controller('AuditErrorListCtrl', {$scope: $scope});  
}]);