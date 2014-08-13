function FormListCtrl($scope, $http) {
    $scope.listForms = [];
    $http.post('/findForms', {}).success(function(forms) {
        $scope.listForms = forms;
    });
}