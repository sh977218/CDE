angular.module('systemModule').controller('AuthCtrl',
    ['$scope', 'Auth', '$window', '$http', 'LoginRedirect', '$location', 'Alert',
    function($scope, Auth, $window, $http, LoginRedirect, $location, Alert)
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
                recaptcha: recaptcha,
                _csrf: $scope.csrf
            },
            function (res) {
                if (res === "OK") {
                    if (LoginRedirect.getPreviousRoute()) $window.location.href = LoginRedirect.getPreviousRoute();
                    else $window.location.href = "/";
                } else {
                    Alert.addAlert("danger", res.data);
                    $scope.getCsrf();

                }
            },
            function (err, statusCode) {
                if (statusCode === 412) {
                    Alert.addAlert("danger", "Please fill out the Captcha before login in.");
                } else {
                    Alert.addAlert("danger", "Failed to log in.");
                }
                $scope.getCsrf();
            });
    };

    $scope.oauthEnabled = window.oauthEnabled;
    $scope.siteKey = window.siteKey;


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