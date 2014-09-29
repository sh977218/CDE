var IdsCtrl = function ($scope, $modal, $window) {
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
            if ($scope.elt.unsaved) {
                $scope.addAlert("info", "Identifier added. Save to confirm.")
            } else {
                $scope.elt.$save(function(newElt) {
                    $window.location.href = $scope.baseLink + newElt._id;  
                    $scope.addAlert("success", "Identifier Added");
                });
            }
        });
    };
    
    $scope.removeId = function (index) {
        $scope.elt.ids.splice(index, 1);
        if ($scope.elt.unsaved) {
            $scope.addAlert("info", "Identifier removed. Save to confirm.")
        } else {
            $scope.elt.$save(function(newElt) {
                $window.location.href = $scope.baseLink + newElt._id;  
                $scope.addAlert("success", "Identifier Removed");
            });        
        }
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
