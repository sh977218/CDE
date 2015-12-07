angular.module('systemModule').controller('VersionCtrl', ['$scope', '$uibModal', '$location',
    function($scope, $modal, $location)
{
    $scope.stageElt = function(elt) {
        elt.unsaved = true;
    };
    
    $scope.openSave = function (elt, redirectBaseLink) {
        var modalInstance = $modal.open({
          templateUrl: '/system/public/html/saveModal.html',
          controller: 'SaveModalCtrl',
          resolve: {
              elt: function() {return $scope.elt;}
          }
        });
        modalInstance.result.then(function (newelt) {
            $scope.save();
        }, function(reason) {
        });
    };
}
]);

angular.module('systemModule').controller('SaveModalCtrl', ['$scope', '$uibModalInstance', 'elt',
    function($scope, $modalInstance, elt)
    {
        $scope.elt = elt;
        $scope.ok = function() {
            $modalInstance.close();
        };

        $scope.cancelSave = function() {
            $modalInstance.dismiss('cancel');
        };
    }
]);