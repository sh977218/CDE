angular.module('systemModule').controller('VersionCtrl', ['$scope', '$uibModal', '$location',
    function ($scope, $modal) {
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
            }, function () {
            });
        };
    }
]);

angular.module('systemModule').controller('SaveModalCtrl', ['$scope', 'elt', '$http',
    function ($scope, elt, $http) {
        $scope.elt = elt;

        $scope.$watch('elt.version', function () {
            var lastVersion = $scope.elt.version;
            if ($scope.elt.formElements) {
                url = '/formByTinyIdAndVersion/' + $scope.elt.tinyId + "/" + $scope.elt.version;
            } else {
                url = '/deExists/' + $scope.elt.tinyId + "/" + $scope.elt.version
            }
            $http.get(url).success(function (data) {
                if (lastVersion !== $scope.elt.version) return;
                $scope.saveForm.version.$setValidity('unique', !data);
            }).error(function () {
                if (lastVersion !== scope.elt.version) return;
                $scope.saveForm.version.$setValidity('unique', false);
            });
        });

    }
]);