function CreateFormCtrl($scope, $http) {
    $scope.validationErrors = function() {
        if (!$scope.cde.designation) {
            return "Please enter a name for the new CDE";
        } else if (!$scope.cde.definition) {
            return "Please enter a definition for the new CDE";
        } else if (!$scope.cde.stewardOrg) {
            return "Please select a steward for the new CDE";
        }
        if ($scope.cde.classification.length === 0) {
            return "Please select at least one classification";
        } else {
            var found = false;
            for (var i = 0; i < $scope.cde.classification.length; i++) {
                if ($scope.cde.classification[i].stewardOrg.name === $scope.cde.stewardOrg.name) {
                    found = true;
                }
            }
            if (!found) {
                return "Please select at least one classification owned by " + $scope.cde.stewardOrg.name;            
            }
        } 
        return null;
    };
}