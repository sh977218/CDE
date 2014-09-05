var PropertiesCtrl = function ($scope, $modal, $http, $window, $timeout) {
    $scope.openNewProperty = function () {
        var modalInstance = $modal.open({
          templateUrl: 'newPropertyModalContent.html',
          controller: NewPropertyModalCtrl,
          resolve: {
              cde: function() {
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
            $scope.elt.$save(function (newcde) {
                $window.location.href = "/#/deview?tab=6&cdeId=" + newcde._id;
                $scope.addAlert("success", "Property Added"); 
            });
        });
    };
    
    $scope.removeProperty = function (index) {
        $scope.elt.properties.splice(index, 1);
        $scope.elt.$save(function (newcde) {
            $window.location.href = "/#/deview?tab=6&cdeId=" + newcde._id;
            $scope.addAlert("success", "Property Removed"); 
        });
    };

    $scope.canEditProperty = function () {
        return $scope.canCurate && !$scope.elt.unsaved;
    };

    $scope.saveProperty = function() {
        $timeout(function() {
            $scope.elt.$save(function (newcde) {
                $window.location.href = "/#/deview?tab=6&cdeId=" + newcde._id;
            });
        }, 0);
    };

};

function NewPropertyModalCtrl($scope, $modalInstance, cde) {
    $scope.elt = cde;
    $scope.newProperty = {};

    $scope.okCreate = function () {
        $modalInstance.close($scope.newProperty);
    };    
    
    $scope.cancelCreate = function() {
        $modalInstance.dismiss("Cancel");
    };
};
