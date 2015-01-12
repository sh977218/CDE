var MappingSpecificationsCtrl = function ($scope, $modal, $window) {
    $scope.openNewMappingSpecification = function () {
        var modalInstance = $modal.open({
          templateUrl: 'newMappingSpecificationModalContent.html',
          controller: NewMappingSpecificationModalCtrl,
          resolve: {
              elt: function() {
                  return $scope.elt;
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
                $scope.elt.$save(function (newElt) {
                    $window.location.href = $scope.baseLink + newElt._id + "&tab=mappingSpecifications";  
                    $scope.addAlert("success", "Mapping Specification Added"); 
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
                $window.location.href = $scope.baseLink + newElt._id + "&tab=mappingSpecifications";  
                $scope.addAlert("success", "Mapping Specification Removed"); 
            });
        }
    };

};

function NewMappingSpecificationModalCtrl($scope, $modalInstance, $http, elt) {
    $scope.elt = elt;
    $scope.newMappingSpecification = {};
    $scope.autocompleteList = [];
    
    $http.get("/cde/mappingSpecifications/types").then(function(result) {
        $scope.typeAutocompleteList = result.data;
    });
    $http.get("/cde/mappingSpecifications/contents").then(function(result) {
        $scope.contentAutocompleteList = result.data;
    });

    $scope.okCreate = function () {
        $modalInstance.close($scope.newMappingSpecification);
    };    
    
    $scope.cancelCreate = function() {
        $modalInstance.dismiss("Cancel");
    };
};
