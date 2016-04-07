angular.module('systemModule').controller('VersionCtrl', ['$scope', '$uibModal', '$location', '$log',
    function ($scope, $modal, $log) {
        $scope.stageElt = function (elt) {
            elt.unsaved = true;
        };

        $scope.openSave = function () {
            var modalInstance = $modal.open({
                animation: false,
                templateUrl: '/system/public/html/saveModal.html',
                controller: 'SaveModalCtrl',
                resolve: {
                    elt: function () {
                        return $scope.elt;
                    }
                }
            });
            modalInstance.result.then(function () {
                $scope.save();
            }, function (reason) {
                $log.info("CDE save modal dismissed.");
            });
        };
    }
]);

angular.module('systemModule').controller('SaveModalCtrl', ['$scope', '$uibModalInstance', 'elt',
    function ($scope, $modalInstance, elt) {
        $scope.elt = elt;
        $scope.ok = function () {
            $modalInstance.close();
        };

        $scope.cancelSave = function () {
            $modalInstance.dismiss('cancel');
        };
    }
]);