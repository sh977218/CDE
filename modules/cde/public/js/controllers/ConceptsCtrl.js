angular.module('cdeModule').controller('ConceptsCtrl', ['$scope', '$uibModal', '$http', function($scope, $modal, $http)
{
    $scope.openNewConcept = function () {
        $modal.open({
            animation: false,
            templateUrl: 'newConceptModalContent.html',
            controller: 'NewConceptModalCtrl',
            resolve: {
              cde: function() {
                  return $scope.elt;
              }
          }
        });
    };



    $scope.dataElementConceptRemoveConcept = function (index) {
        $scope.elt.dataElementConcept.concepts.splice(index, 1);
        $scope.elt.unsaved = true;
    };
    
    $scope.objectClassRemoveConcept = function (index) {
        $scope.elt.objectClass.concepts.splice(index, 1);
        $scope.elt.unsaved = true;
    };

    $scope.propertyRemoveConcept = function (index) {
        $scope.elt.property.concepts.splice(index, 1);
        $scope.elt.unsaved = true;
    };

    $scope.removeConcept = function(type) {
        $scope[type + 'RemoveConcept']();
    };

    $scope. conceptConfigurations = [
        {type: "dataElementConcept", display: "Data Element Concept"},
        {type: "objectClass", display: "Object Class"},
        {type: "property", display: "Property"}
    ];

    $scope.relatedCdes = function (concept) {
        $http({method: "POST", url: "/desByConcept", data: concept})
            .success(function (data) {
                $scope.cdes = data;
                for (var i=0; i < $scope.cdes.length; i++) {
                    if ($scope.cdes[i].tinyId === $scope.elt.tinyId) {
                        $scope.cdes.splice(i, 1);
                    }
                }
            });
    };
}
]);