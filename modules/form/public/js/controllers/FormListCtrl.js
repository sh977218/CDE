angular.module('formModule').controller('FormListCtrl', ['$scope', '$controller', '$location', '$window'
        , function($scope, $controller, $location, $window) {

    $scope.module = "form";    
    $controller('ListCtrl', {$scope: $scope});   
    
}]);