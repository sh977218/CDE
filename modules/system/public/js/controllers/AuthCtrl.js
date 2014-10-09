function AuthCtrl($scope, Auth, $window) {
    $scope.login = function() {
        Auth.login({
                username: $scope.username,
                password: $scope.password,
                _csrf: $scope.csrf
            },
            function(res) {
                if (res === "OK") {
                    $window.location.href = "/";
                } else {
                    $scope.addAlert("success", res);
                }
              },
            function(err) {
                $scope.addAlert("danger", "Failed to login.");
            });
    };
}
