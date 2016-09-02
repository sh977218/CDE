angular.module('cdeModule').controller('ConceptsCtrl', ['$scope', '$uibModal', '$location', function($scope, $modal, $location)
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

    $scope.conceptConfigurations = {
        "dataElementConcept": {display: "Data Element Concept", path: "dataElementConcept.concepts.name"},
        "objectClass": {display: "Object Class", path: "objectClass.concepts.name"},
        "property": {display: "Property", path: "property.concepts.name"}
    };

    $scope.relatedCdes = function (concept, type) {
        $location.url('/cde/search?q=' + $scope.conceptConfigurations[type].path + ':"' + concept + '"');
    };
}
]);