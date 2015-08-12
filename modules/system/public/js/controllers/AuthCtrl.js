angular.module('systemModule').controller('AuthCtrl', ['$scope', 'Auth', '$location', '$http',
    function($scope, Auth, $location, $http)
{
    
    $scope.getCsrf = function() {
        delete $scope.csrf;
        
        $http.get('/csrf').then(function(res) {
            $scope.csrf = res.data;
        });

    };
    
    $scope.getCsrf();
    
    $scope.login = function() {
        Auth.login({
                username: $scope.username,
                password: $scope.password,
                _csrf: $scope.csrf
            },
            function(res) {
                if (res === "OK") {
                    $location.url = "/";
                } else {
                    $scope.addAlert("danger", res.data);
                    $scope.getCsrf();
                }
              },
            function(err) {
                $scope.addAlert("danger", "Failed to log in.");
                $scope.getCsrf();
            });
    };
}
]);