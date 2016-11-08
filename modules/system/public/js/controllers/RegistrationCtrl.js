angular.module('systemModule').controller('RegistrationCtrl',
    ['$scope', '$uibModal', '$location', '$http', 'Alert',
        function ($scope, $modal, $location, $http, Alert) {

            $scope.openRegStatusUpdate = function () {
                $http.get('/comments/eltId/' + $scope.elt.tinyId).then(function (result) {
                    if (result && result.data && result.data.filter && result.data.filter(function (a) {
                            return a.status !== 'resolved' && a.status !== 'deleted'
                        }).length > 0) {
                        Alert.addAlert('info', "Info: There are unresolved comments. ")
                    }

                    $modal.open({
                        animation: false,
                        templateUrl: '/system/public/html/regStatusUpdateModal.html',
                        controller: 'RegistrationModalCtrl',
                        resolve: {
                            elt: function () {
                                return $scope.elt;
                            },
                            siteAdmin: function () {
                                return $scope.isSiteAdmin();
                            }
                        }
                    }).result.then(function (newElt) {
                        $location.url($scope.baseLink + newElt.tinyId);
                        Alert.addAlert("success", "Saved");
                    }, function () {
                        $scope.revert($scope.elt);
                    });
                });
            };

        }
    ]);