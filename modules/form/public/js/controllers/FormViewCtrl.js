function FormViewCtrl($scope, $routeParams, $http) {
    $scope.form = {_id: $routeParams._id};
    
    $http.get("/form/" + $scope.form._id).success(function(form) {
        $scope.form = form;
    });
}