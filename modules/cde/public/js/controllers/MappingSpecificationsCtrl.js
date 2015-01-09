var MappingSpecificationsCtrl = function ($scope, $modal, $window, $timeout) {
    $scope.openNewMappingSpecification = function () {
        var modalInstance = $modal.open({
          templateUrl: 'newMappingSpecificationModalContent.html',
          controller: NewMappingSpecificationModalCtrl,
          resolve: {
              elt: function() {
                  return $scope.elt;
              },
              module: function() {
                  return $scope.module;
              }
          }
        });
        
        modalInstance.result.then(function (newMappingSpecification) {
            for (var i = 0; i < $scope.elt.mappingSpecifications.length; i++) {
                if ($scope.elt.mappingSpecifications[i].content === newMappingSpecification.content && 
                        $scope.elt.mappingSpecifications[i].spec_type === newMappingSpecification.spec_type) {
                    $scope.addAlert("danger", "This specification already exists.");
                    return;
                }
            }
            $scope.elt.mappingSpecifications.push(newMappingSpecification);
            if ($scope.elt.unsaved) {
                $scope.addAlert("info", "Mapping Specification added. Save to confirm.");
            } else {
                console.log($scope.elt)
                $scope.elt.$save(function (newElt) {
                    $window.location.href = $scope.baseLink + newElt._id + "&tab=properties";  
                    $scope.addAlert("success", "Mapping Specification Added"); 
                console.log($scope.elt)
                });
            }
        });
    };
    
    $scope.removeMappingSpecification = function (index) {
        $scope.elt.mappingSpecifications.splice(index, 1);
        if ($scope.elt.unsaved) {
            $scope.addAlert("info", "Mapping Specification removed. Save to confirm.");
        } else {
            $scope.elt.$save(function (newElt) {
                $window.location.href = $scope.baseLink + newElt._id + "&tab=properties";  
                $scope.addAlert("success", "Mapping Specification Removed"); 
            });
        }
    };

};

function NewMappingSpecificationModalCtrl($scope, $modalInstance, $http, module, elt) {
    $scope.elt = elt;
    $scope.newMappingSpecification = {};
    $scope.autocompleteList = [];
    
    $http.get("/" + module + "/mappingSpecifications/types").then(function(result) {
        $scope.typeAutocompleteList = result.data;
    });
    $http.get("/" + module + "/mappingSpecifications/contents").then(function(result) {
        $scope.contentAutocompleteList = result.data;
    });

    $scope.okCreate = function () {
        $modalInstance.close($scope.newMappingSpecification);
    };    
    
    $scope.cancelCreate = function() {
        $modalInstance.dismiss("Cancel");
    };
};
