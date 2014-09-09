function ConceptsCtrl($scope, $modal, $http) {
    $scope.openNewConcept = function () {
        $modal.open({
          templateUrl: 'newConceptModalContent.html',
          controller: NewConceptModalCtrl,
          resolve: {
              cde: function() {
                  return $scope.elt;
              }
          }
        });
    };
    
    $scope.removeDecConcept = function (index) {
        $scope.elt.dataElementConcept.concepts.splice(index, 1);
        $scope.elt.unsaved = true;
    };
    
    $scope.removeOcConcept = function (index) {
        $scope.elt.objectClass.concepts.splice(index, 1);
        $scope.elt.unsaved = true;
    };
    
    $scope.removePropConcept = function (index) {
        $scope.elt.property.concepts.splice(index, 1);
        $scope.elt.unsaved = true;
    };
    
    $scope.relatedCdes = function (concept) {
        $http({method: "POST", url: "/desByConcept", data: concept})
                .success(function (data, status) {
                  $scope.cdes = data;         
            });
    };
}
