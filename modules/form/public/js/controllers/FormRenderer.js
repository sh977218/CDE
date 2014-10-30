var formApp = angular.module('FormRenderer', ['ui.bootstrap']);
formApp.config(function($locationProvider) {
    $locationProvider.html5Mode(true);
});
formApp.config(['$compileProvider', function($compileProvider) {
  $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|file|blob):|data:text\//);
}]);

function FormRenderCtrl($scope, $http, $location, $window) {
   
    $scope.reload = function(id) {
        $http.get('/form/' + id).then(function(result) {
           $scope.myForm = result.data; 
           delete $scope.myForm.attachments;
           delete $scope.myForm.classification;
           delete $scope.myForm.comments;
           delete $scope.myForm.created;
           delete $scope.myForm.createdBy;
           delete $scope.myForm.history;
           delete $scope.myForm.properties;
           delete $scope.myForm.registrationState;
           delete $scope.myForm.stewardOrg;
        });
    };
                
    $scope.reload( $location.search().id );

    $scope.addSection = function(index) {
        var newElt =  JSON.parse(JSON.stringify($scope.myForm.formElements[index]));
        newElt.isCopy = true;
        $scope.myForm.formElements.splice(index + 1, 0, newElt);
    };
    
    $scope.removeSection = function(index) {
        $scope.myForm.formElements.splice(index, 1);
    };    
    
    $scope.canRepeat = function(formElt) {
        return formElt.cardinality === '*' || formElt.cardinality === '+';
    };
    
    $scope.checkIe = function() {
        var browsers = {chrome: /chrome/i, safari: /safari/i, firefox: /firefox/i, ie: /MSIE/i};
        if (browsers['ie'].test($window.navigator.userAgent)) {
            $scope.addAlert("danger", "For security reasons, exporting is not available in Internet Explorer. Consider using a different browser for this task.");
        }
    };
    
    var stripFieldsOut = function(elt) {
        delete elt.cardinality;
        delete elt.$$hashKey;
        if (elt.question) {
            delete elt.question.answers;
            delete elt.question.uoms;
            delete elt.question.required;
            delete elt.question.datatype;
            if (elt.question.cde) {
                delete elt.question.cde.permissibleValues;
            }
            if (elt.question.otherPleaseSpecify) {
                if (!elt.question.otherPleaseSpecify.value) {
                    delete elt.question.otherPleaseSpecify;
                } else {
                    delete elt.question.otherPleaseSpecify.value;
                }
            }
        }
        if (elt.formElements) {
            for (var i = 0; i < elt.formElements.length; i++) {
                stripFieldsOut(elt.formElements[i]);
            }
        }
    };
    
    $scope.exportStr = function() {
        var formData = JSON.parse(JSON.stringify($scope.myForm));
        if (formData.formElements) {
            for (var i = 0; i < formData.formElements.length; i++) {
                stripFieldsOut(formData.formElements[i]);
            }
        }
        console.log(formData);
        $scope.encodedStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(formData));
    };

}