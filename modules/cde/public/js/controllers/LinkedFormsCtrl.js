angular.module('cdeModule').controller('LinkedFormsCtrl', ['$scope', '$controller', function($scope, $controller) {
    $scope.module = "form";   

    $scope.searchSettings = {q: '"' + $scope.elt.tinyId + '"'};
    $scope.registrationStatuses = [];

    $controller('ListCtrl', {$scope: $scope});
    
}
]);