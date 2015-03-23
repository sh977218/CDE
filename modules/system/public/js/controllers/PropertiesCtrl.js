angular.module('systemModule').controller('PropertiesCtrl', ['$scope', '$modal', '$window', '$timeout', function($scope, $modal, $window, $timeout) {
    $scope.openNewProperty = function () {
        var modalInstance = $modal.open({
          templateUrl: 'newPropertyModalContent.html',
          controller: 'NewPropertyModalCtrl',
          resolve: {
              elt: function() {
                  return $scope.elt;
              },
              module: function() {
                  return $scope.module;
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
                $scope.addAlert("info", "Property added. Save to confirm.");
            } else {
                $scope.elt.$save(function (newElt) {
                    $window.location.href = $scope.baseLink + newElt.tinyId + "&tab=properties";
                    $scope.addAlert("success", "Property Added"); 
                });
            }
        });
    };
    
    $scope.removeProperty = function (index) {
        $scope.elt.properties.splice(index, 1);
        if ($scope.elt.unsaved) {
            $scope.addAlert("info", "Property removed. Save to confirm.");
        } else {
            $scope.elt.$save(function (newElt) {
                $window.location.href = $scope.baseLink + newElt.tinyId + "&tab=properties";
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
                $window.location.href = $scope.baseLink + newElt.tinyId + "&tab=properties";
                $scope.elt = newElt;
            });
        }, 0);
    };

}]);

angular.module('systemModule').controller('NewPropertyModalCtrl', ['$scope', '$modalInstance', '$http','module', 'elt', function($scope, $modalInstance, $http, module, elt) {
    $scope.elt = elt;
    $scope.newProperty = {};
    $scope.autocompleteList = [];
    
    $http.get("/" + module + "/properties/keys").then(function(result) {
        $scope.autocompleteList = result.data;
    });

    $scope.okCreate = function () {
        $modalInstance.close($scope.newProperty);
    };    
    
    $scope.cancelCreate = function() {
        $modalInstance.dismiss("Cancel");
    };
}]);
