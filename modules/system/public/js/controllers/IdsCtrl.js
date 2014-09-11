var IdsCtrl = function ($scope, $modal, $http, DataElement) {
    $scope.openNewId = function () {
        var modalInstance = $modal.open({
          templateUrl: 'newIdModalContent.html',
          controller: NewIdModalCtrl,
          resolve: {
              elt: function() {
                  return $scope.elt;
              }
          }
        });
        
        modalInstance.result.then(function (newId) {
            $scope.elt.ids.push(newId);
            $scope.elt.$save(function(newElt) {
                $scope.elt = newElt;
                $scope.addAlert("success", "Identifier Added");
            });
        });
    };
    
    $scope.removeId = function (index) {
        $scope.elt.ids.splice(index, 1);
        $scope.elt.$save(function(newElt) {
            $scope.elt = newElt;
            $scope.addAlert("success", "Identifier Removed");
        });        
    };
};

function NewIdModalCtrl($scope, $modalInstance, elt) {
    $scope.elt = elt;
    $scope.newId = {};

    $scope.okCreate = function () {
        $modalInstance.close($scope.newId);
    };    
    
    $scope.cancelCreate = function() {
        $modalInstance.dismiss("Cancel");
    };
};
