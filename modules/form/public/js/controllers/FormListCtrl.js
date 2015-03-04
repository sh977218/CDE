angular.module('formModule').controller('FormListCtrl', ['$scope', '$controller', function($scope, $controller) {
    $scope.module = "form";    
    $controller('ListCtrl', {$scope: $scope});
}]);