angular.module('systemModule').controller('ClassificationAuditLogCtrl', ['$scope', '$controller', function($scope, $controller) {
    $scope.api = "/getClassificationAuditLog";
    $controller('AuditErrorListCtrl', {$scope: $scope});

    $scope.gotoPageLocal = function(page){
        $scope.gotoPage(page);
    };
    $scope.gotoPage(1);
}]);