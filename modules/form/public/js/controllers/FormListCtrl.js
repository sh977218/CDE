angular.module('formModule').controller('FormListCtrl', ['$scope', '$controller', '$location', '$window'
        , function($scope, $controller, $location, $window) {

    $scope.module = "form";    
    $controller('ListCtrl', {$scope: $scope});   
    
}]);

angular.module('formModule').controller('FormDEListCtrl', ['$scope'
    , function($scope) {

    $scope.embedded = true;

    $scope.reset = function() {
        $scope.resetSearch();
    }

}]);