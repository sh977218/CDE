var formApp = angular.module('FormRenderer', ['ui.bootstrap']);
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
                
    $scope.reload(location.search.substring(4));

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
    
    $scope.isIe = function() {
        var browsers = {chrome: /chrome/i, safari: /safari/i, firefox: /firefox/i, ie: /MSIE/i};
        return browsers['ie'].test($window.navigator.userAgent);
    };
    
    var stripFieldsOut = function(elt) {
        delete elt.cardinality;
        delete elt.$$hashKey;
        if (elt.elementType === 'section') {
            delete elt.question;
        }
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
        if (!$scope.isIe()) {
            var formData = JSON.parse(JSON.stringify($scope.myForm));
            if (formData.formElements) {
                for (var i = 0; i < formData.formElements.length; i++) {
                    stripFieldsOut(formData.formElements[i]);
                }
            }
            $scope.encodedStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(formData));
        } else {
            alert("For security reasons, this feature is not supported in IE. ");
            $scope.encodedStr = '/';
        }
    };

}