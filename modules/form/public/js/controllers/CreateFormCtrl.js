angular.module('formModule').controller('CreateFormCtrl', ['$scope', 'Form', '$location',
    function($scope, Form, $location)
{
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

    $scope.$on('$locationChangeStart', function( event ) {
        if (!$scope.saving) {
            var answer = confirm("You have unsaved changes, are you sure you want to leave this page?");
            if (!answer) {
                event.preventDefault();
            }
        }
    });

    $scope.save = function() {
        $scope.saving = true;
        $scope.newForm.naming.push({
           designation: $scope.newForm.designation
           , definition: $scope.newForm.definition
           , context: {
               contextName: "Health"
               , acceptability: "preferred"
           }
        });
        Form.save($scope.newForm, function(form) {
            $location.url("formView?tinyId=" + form.tinyId);
            $scope.addAlert("success", "Form created.");
        });
    };
}]);