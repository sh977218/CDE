var formApp = angular.module('FormRenderer', ['ui.bootstrap']);
formApp.config(function($locationProvider) {
    $locationProvider.html5Mode(true);
});

function FormRenderCtrl($scope, $http, $location) {
   
    $scope.reload = function(id) {
        $http.get('/form/' + id).then(function(result) {
           $scope.myForm = result.data; 
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

}