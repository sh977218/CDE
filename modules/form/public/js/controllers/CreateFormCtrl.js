function CreateFormCtrl($scope, $http, $window) {
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
    
    $scope.createNewForm = function(newForm) {
        var form = {
            naming: [{
                designation: newForm.designation
                , definition: newForm.definition
            }]
            , version: newForm.version
            , stewardOrg: newForm.stewardOrg
        };
        $http.post('/createForm', {form: form}).success(function(form) {
            $window.location.href = "/#/formView?_id=" + form._id;        
        });
    };
}