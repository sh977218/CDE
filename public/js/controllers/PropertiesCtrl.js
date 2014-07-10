var PropertiesCtrl = function ($scope, $modal, $http, $window, $timeout) {
    $scope.openNewProperty = function () {
        var modalInstance = $modal.open({
          templateUrl: 'newPropertyModalContent.html',
          controller: NewPropertyModalCtrl,
          resolve: {
              cde: function() {
                  return $scope.cde;
              }
          }
        });
        
        modalInstance.result.then(function (newProperty) {
            for (var i = 0; i < $scope.cde.properties.length; i++) {
                if ($scope.cde.properties[i].key === newProperty.key) {
                    $scope.addAlert("danger", "This property already exists.");
                    return;
                }
            }
            $scope.cde.properties.push(newProperty);
            $scope.cde.$save(function (newcde) {
                $window.location.href = "/#/deview?tab=6&cdeId=" + newcde._id;
                $scope.addAlert("success", "Property Added"); 
            });
        });
    };
    
    $scope.removeProperty = function (index) {
        $scope.cde.properties.splice(index, 1);
        $scope.cde.$save(function (newcde) {
            $window.location.href = "/#/deview?tab=6&cdeId=" + newcde._id;
            $scope.addAlert("success", "Property Removed"); 
        });
    };

    $scope.canEditProperty = function () {
        return $scope.isAllowed($scope.cde) && !$scope.cde.unsaved;
    };

    $scope.saveProperty = function() {
        $timeout(function() {
            $scope.cde.$save(function (newcde) {
                $window.location.href = "/#/deview?tab=6&cdeId=" + newcde._id;
            });
        }, 0);
    };

};

function NewPropertyModalCtrl($scope, $modalInstance, cde) {
    $scope.cde = cde;
    $scope.newProperty = {};

    $scope.okCreate = function () {
        $modalInstance.close($scope.newProperty);
    };    
    
    $scope.cancelCreate = function() {
        $modalInstance.dismiss("Cancel");
    };
};
