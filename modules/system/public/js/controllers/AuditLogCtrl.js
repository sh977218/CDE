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
    
    $scope.loadNewerLocal = function(){        
        $scope.loadNewer();
        $scope.registerPopulator();
    };
    $scope.loadOlderLocal = function(){        
        $scope.loadOlder();
        $scope.registerPopulator();
    };    
}]);