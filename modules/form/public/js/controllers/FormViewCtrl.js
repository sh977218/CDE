function FormViewCtrl($scope, $routeParams, $http) {
    $scope.form = {_id: $routeParams._id, name: "123"};
    
    $http.get("/viewForm?_id=" + $scope.form._id).success(function(form) {
        $scope.form = form;
    });
}