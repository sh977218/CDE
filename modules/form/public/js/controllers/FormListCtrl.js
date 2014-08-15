function FormListCtrl($scope, $http, $controller) {
    $scope.module = "form";
    $controller('ListCtrl', {$scope: $scope});    
    
    $scope.listForms = [];
    $scope.reload = function() {
        $http.post('/findForms', {term: $scope.currentSearchTerm}).success(function(forms) {
            $scope.cdes = forms;
        });
    };
}