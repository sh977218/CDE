angular.module('systemModule').controller('AuditLogCtrl', ['$scope', '$controller', 'CdeDiffPopulate', function($scope, $controller, CdeDiffPopulate) {
    $scope.api = "/getCdeAuditLog"; 
    $controller('AuditErrorListCtrl', {$scope: $scope});  

    $scope.gotoPageLocal = function(page){
        $scope.gotoPage(page, function(){
            $scope.records.forEach(function(rec){
                rec.diff.forEach(function(d){
                    CdeDiffPopulate.makeHumanReadable(d);
                });
            });
        });
    };
    $scope.gotoPageLocal(1);
}]);