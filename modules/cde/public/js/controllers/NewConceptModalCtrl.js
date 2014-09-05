function NewConceptModalCtrl($scope, $modalInstance, cde) {
    $scope.newConcept = {origin: "LOINC", type: "dec"};
    $scope.elt = cde;
    
    $scope.cancelCreate = function() {
        $modalInstance.dismiss('cancel');
    };

    $scope.okCreate = function() {
        if (!cde.dataElementConcept) cde.dataElementConcept = {};
        if ($scope.newConcept.type === "dec") {
            if (!cde.dataElementConcept.concepts) cde.dataElementConcept.concepts = [];
            cde.dataElementConcept.concepts.push($scope.newConcept);
        } else if ($scope.newConcept.type === "prop") {
            if (!cde.property.concepts) cde.property.concepts = [];
            cde.property.concepts.push($scope.newConcept);
        } else if ($scope.newConcept.type === "oc") {
            if (!cde.objectClass.concepts) cde.objectClass.concepts = [];
            cde.objectClass.concepts.push($scope.newConcept);
        } 
        cde.unsaved = true;
        $modalInstance.close();
    };
};
