angular.module('systemModule').controller('IdsCtrl', ['$scope', '$uibModal', '$window', function($scope, $modal) {
    $scope.openNewId = function () {
        $modal.open({
            animation: false,
          templateUrl: 'newIdModalContent.html',
          controller: 'NewIdModalCtrl',
          resolve: {
              elt: function() {
                  return $scope.elt;
              }
          }
        }).result.then(function (newId) {
            $scope.elt.ids.push(newId);
            if ($scope.elt.unsaved) {
                $scope.addAlert("info", "Identifier added. Save to confirm.")
            } else {
                $scope.elt.$save(function(newElt) {
                    $scope.elt = newElt;
                    $scope.addAlert("success", "Identifier Added");
                });
            }
        }, function () {});
    };
    
    $scope.removeId = function (index) {
        $scope.elt.ids.splice(index, 1);
        if ($scope.elt.unsaved) {
            $scope.addAlert("info", "Identifier removed. Save to confirm.")
        } else {
            $scope.elt.$save(function(newElt) {
                $scope.elt = newElt;
                $scope.addAlert("success", "Identifier Removed");
            });        
        }
    };
}]);

angular.module('systemModule').controller('NewIdModalCtrl', ['$scope', '$uibModalInstance', 'elt',
    function($scope, $modalInstance, elt) {

    $scope.elt = elt;
    $scope.newId = {};

    $scope.okCreate = function () {
        $modalInstance.close($scope.newId);
    };    
    
    $scope.cancelCreate = function() {
        $modalInstance.dismiss("Cancel");
    };
}]);
