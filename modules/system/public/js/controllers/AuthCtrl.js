angular.module('systemModule').controller('AuthCtrl', // jshint ignore:line
    ['$scope', 'Auth', '$window', '$http', 'LoginRedirect', '$location',
    function($scope, Auth, $window, $http, LoginRedirect, $location)
{

    $scope.getCsrf = function () {
        delete $scope.csrf;

        $http.get('/csrf').then(function (res) {
            $scope.csrf = res.data.csrf;
            $scope.showCaptcha = res.data.showCaptcha;
        });

    };

    $scope.getCsrf();

    $scope.login = function () {
        var recaptcha;
        try {
            recaptcha = grecaptcha.getResponse(); // jshint ignore:line


        } catch (e) {}
        Auth.login({
                username: $scope.username,
                password: $scope.password,
                reCaptcha: recaptcha,
                _csrf: $scope.csrf
            },
            function (res) {
                if (res === "OK") {
                    if (LoginRedirect.getPreviousRoute()) $window.location.href = LoginRedirect.getPreviousRoute();
                    else $window.location.href = "/";
                } else {
                    $scope.addAlert("danger", res.data);
                    $scope.getCsrf();

                }
            },
            function () {
                $scope.addAlert("danger", "Failed to log in.");
                $scope.getCsrf();
            });
    };

    $scope.oauthEnabled = window.oauthEnabled;

    $scope.goToLogin = function () {
        LoginRedirect.storeRoute($location.$$url);
    };

    $scope.logout = function () {
        $http.post("/logout", {}).then(function() {
            $window.location.href = "/login";
        });
    };

}
]);