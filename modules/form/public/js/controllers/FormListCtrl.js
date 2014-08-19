function FormListCtrl($scope, $http, $controller) {
    $scope.module = "form";
    $controller('ListCtrl', {$scope: $scope});    
    
    for (var j = 0; j < $scope.registrationStatuses.length; j++) {
        $scope.registrationStatuses[j].count = 0;
    }    
    
    $scope.listForms = [];
    $scope.reload = function() {
        $http.post('/findForms', {criteria: {term: $scope.currentSearchTerm}}).success(function(forms) {
            $scope.cdes = forms;
        });
    };
}