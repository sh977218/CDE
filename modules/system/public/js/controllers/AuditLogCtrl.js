angular.module('systemModule').controller('AuditLogCtrl', ['$scope', '$http', function($scope, $http) {
    $scope.api = "/getClientErrors"; 
    $controller('AuditErrorListCtrl', {$scope: $scope});  
}]);