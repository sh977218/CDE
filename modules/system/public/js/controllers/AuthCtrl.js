function AuthCtrl($scope, Auth, $window) {
    $scope.login = function() {
        Auth.login({
                username: $scope.username,
                password: $scope.password
            },
            function(res) {
                if (res === "OK") {
                    $window.location.href = "/";
                } else {
                    $scope.message = res;
                }
              },
            function(err) {
                $scope.message = "Failed to login";
            });
    };
}
