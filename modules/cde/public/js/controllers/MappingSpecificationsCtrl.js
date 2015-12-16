angular.module('cdeModule').controller('MappingSpecificationsCtrl', ['$scope', '$uibModal', '$location',
    function($scope, $modal, $location)
{
    $scope.openNewMappingSpecification = function () {
        var modalInstance = $modal.open({
            animation: false,
          templateUrl: 'newMappingSpecificationModalContent.html',
          controller: 'NewMappingSpecificationModalCtrl',
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
                    $location.url($scope.baseLink + newElt.tinyId + "&tab=mappingSpecifications");
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
                $location.url($scope.baseLink + newElt.tinyId + "&tab=mappingSpecifications");
                $scope.addAlert("success", "Mapping Specification Removed"); 
            });
        }
    };

}]);

angular.module('systemModule').controller('NewMappingSpecificationModalCtrl', ['$scope', '$uibModalInstance', '$http', 'elt',
    function($scope, $modalInstance, $http, elt)
{
    $scope.elt = elt;
    $scope.newMappingSpecification = {};
    $scope.contentAutocompleteList = [];
    $scope.typeAutocompleteList = [];
    
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
}]);