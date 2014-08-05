function CreateFormCtrl($scope, $http) {
    $scope.newForm = {stewardOrg:{}};
    $scope.validationErrors = function() {
        if (!$scope.newForm.designation) {
            return "Please enter a name for the new form.";
        } else if (!$scope.newForm.definition) {
            return "Please enter a definition for the new form.";
        } else if (!$scope.newForm.stewardOrg.name) {
            return "Please select a steward for the new form.";
        }
        return null;
    };
}