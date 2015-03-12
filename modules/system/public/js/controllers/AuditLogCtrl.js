angular.module('systemModule').controller('AuditLogCtrl', ['$scope', '$controller', 'CdeDiffPopulate', function($scope, $controller, CdeDiffPopulate) {
    $scope.api = "/getCdeAuditLog"; 
    $controller('AuditErrorListCtrl', {$scope: $scope});  
    $scope.registerPopulator = function(){
        $scope.promise.then(function(){
            $scope.records.forEach(function(rec){
                rec.diff.forEach(function(d){
                    CdeDiffPopulate.makeHumanReadable(d);
                });            
            });
        });        
    };
    $scope.registerPopulator(); 

    $scope.gotoPageLocal = function(page){
        $scope.gotoPage(page);
        $scope.registerPopulator();           
    };
}]);