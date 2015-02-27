angular.module('systemModule').controller('AuditCtrl', ['$scope', '$modal', function($scope, $modal) {
    $scope.openHistory = function () {
        var modalInstance = $modal.open({
          templateUrl: 'saveCdeModalContent.html',
          controller: 'SaveCdeModalCtrl',
          resolve: {
              cdeId: function() {
                  return $scope.cde_id;
              }
          }
        });

        modalInstance.result.then(function () { 
        }, function () {
        });
    };    
}
]);