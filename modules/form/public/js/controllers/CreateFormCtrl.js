function CreateFormCtrl($scope, Form, $window) {
    $scope.newForm = {stewardOrg:{}, naming: []};
    $scope.validationErrors = function() {
        if (!$scope.newForm.designation) {
            return "Please enter a name for the new form.";
        } else if (!$scope.newForm.definition) {
            return "Please enter form description.";
        } else if (!$scope.newForm.stewardOrg.name) {
            return "Please select a steward for the new form.";
        }
        return null;
    };
    
    $scope.save = function() {
        $scope.newForm.naming.push({
           designation: $scope.newForm.designation
           , definition: $scope.newForm.definition
           , context: {
               contextName: "Health"
               , acceptability: "preferred"
           }
        });
        Form.save($scope.newForm, function(form) {
            $window.location.href = "/#/formView?_id=" + form._id;        
        });
    };
}