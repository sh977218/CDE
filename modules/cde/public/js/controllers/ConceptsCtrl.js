function ConceptsCtrl($scope, $modal, $http) {
    $scope.openNewConcept = function () {
        $modal.open({
          templateUrl: 'newConceptModalContent.html',
          controller: NewConceptModalCtrl,
          resolve: {
              cde: function() {
                  return $scope.cde;
              }
          }
        });
    };
    
    $scope.removeDecConcept = function (index) {
        $scope.cde.dataElementConcept.concepts.splice(index, 1);
        $scope.cde.unsaved = true;
    };
    
    $scope.removeOcConcept = function (index) {
        $scope.cde.objectClass.concepts.splice(index, 1);
        $scope.cde.unsaved = true;
    };
    
    $scope.removePropConcept = function (index) {
        $scope.cde.property.concepts.splice(index, 1);
        $scope.cde.unsaved = true;
    };
    
    $scope.relatedCdes = function (concept) {
        $http({method: "POST", url: "/desByConcept", data: concept})
                .success(function (data, status) {
                  $scope.cdes = data;         
            });
    };
}
