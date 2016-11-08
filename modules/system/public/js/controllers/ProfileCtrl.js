angular.module('systemModule').controller('ProfileCtrl',
    ['$scope', 'ViewingHistory', '$timeout', '$http', 'userResource',
        function ($scope, ViewingHistory, $timeout, $http, userResource) {
            ViewingHistory.getPromise().then(function (response) {
                $scope.cdes = [];
                if (Array.isArray(response))
                    $scope.cdes = response;
            });


            $scope.saveProfile = function () {
                $timeout(function () {
                    $http.post('/user/me', userResource.user).then(function (res) {
                        if (res.status === 200) {
                            $scope.addAlert("success", "Saved");
                        } else {
                            $scope.addAlert("danger", "Error, unable to save");
                        }
                    });
                }, 0);
            };
            userResource.getPromise().then(function () {
                if (userResource.user.username) {
                    $scope.hasQuota = userResource.user.quota;
                    $scope.orgCurator = userResource.user.orgCurator.toString().replace(/,/g, ', ');
                    $scope.orgAdmin = userResource.user.orgAdmin.toString().replace(/,/g, ', ');
                }
            });

        }]);