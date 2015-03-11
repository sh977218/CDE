angular.module('formModule').controller('FormListCtrl', ['$scope', '$controller', '$location', '$window'
        , function($scope, $controller, $location, $window) {

    $scope.module = "form";    
    $controller('ListCtrl', {$scope: $scope});

    $scope.view = function(form, event) {
        $scope.interruptOpenAccordion(event);
        $location.url("formView?_id=" + form._id);
    };    
    
    $scope.viewNewTab = function(cde, event) {
        $scope.interruptOpenAccordion(event);
        $window.open("#/formView?_id=" + form._id);
    };  

}]);