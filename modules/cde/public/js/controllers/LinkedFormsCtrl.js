systemModule.controller('LinkedFormsCtrl', ['$scope', '$controller', function($scope, $controller) {
    $scope.module = "form";   

    $scope.searchForm = {ftsearch: '"' + $scope.elt.tinyId + '"'};
    $scope.registrationStatuses = [];

    $controller('ListCtrl', {$scope: $scope});
    
}
]);