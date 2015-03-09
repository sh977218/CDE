angular.module('systemModule').controller('AuditLogCtrl', ['$scope', '$controller', 'CdeDiffPopulate', function($scope, $controller, CdeDiffPopulate) {
    $scope.api = "/getCdeAuditLog"; 
    $controller('AuditErrorListCtrl', {$scope: $scope});  
    $scope.promise.then(function(){
        $scope.records.forEach(function(rec){
            rec.diff.forEach(function(d){
                CdeDiffPopulate.makeHumanReadable(d);
            });
            
        });
    });
}]);