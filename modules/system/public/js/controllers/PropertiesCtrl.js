var PropertiesCtrl = function ($scope, $modal, $http, $window, $timeout) {
    $scope.openNewProperty = function () {
        var modalInstance = $modal.open({
          templateUrl: 'newPropertyModalContent.html',
          controller: NewPropertyModalCtrl,
          resolve: {
              elt: function() {
                  return $scope.elt;
              }
          }
        });
        
        modalInstance.result.then(function (newProperty) {
            for (var i = 0; i < $scope.elt.properties.length; i++) {
                if ($scope.elt.properties[i].key === newProperty.key) {
                    $scope.addAlert("danger", "This property already exists.");
                    return;
                }
            }
            $scope.elt.properties.push(newProperty);
            if ($scope.elt.unsaved) {
                $scope.addAlert("info", "Property added. Save to confirm.")
            } else {
                $scope.elt.$save(function (newElt) {
                    $scope.elt = newElt;
                    $scope.addAlert("success", "Property Added"); 
                });
            }
        });
    };
    
    $scope.removeProperty = function (index) {
        $scope.elt.properties.splice(index, 1);
        if ($scope.elt.unsaved) {
            $scope.addAlert("info", "Property removed. Save to confirm.")
        } else {
            $scope.elt.$save(function (newElt) {
                $scope.elt = newElt;
                $scope.addAlert("success", "Property Removed"); 
            });
        }
    };

    $scope.canEditProperty = function () {
        return $scope.canCurate && !$scope.elt.unsaved;
    };

    $scope.saveProperty = function() {
        $timeout(function() {
            $scope.elt.$save(function (newElt) {
                $scope.elt = newElt;
            });
        }, 0);
    };

};

function NewPropertyModalCtrl($scope, $modalInstance, elt) {
    $scope.elt = elt;
    $scope.newProperty = {};

    $scope.okCreate = function () {
        $modalInstance.close($scope.newProperty);
    };    
    
    $scope.cancelCreate = function() {
        $modalInstance.dismiss("Cancel");
    };
};
