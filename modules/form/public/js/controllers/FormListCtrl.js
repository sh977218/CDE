function FormListCtrl($scope, $http, $controller) {
    $scope.module = "form";
    $controller('ListCtrl', {$scope: $scope});    
    
    $scope.listForms = [];
    $scope.reload = function() {
        $http.post('/findForms', {}).success(function(forms) {
            $scope.cdes = forms;
            console.log(forms);
        });
    };
}