angular.module('systemModule').controller('VersionCtrl', ['$scope', '$uibModal', function ($scope, $modal) {

        $scope.stageElt = function (elt) {
            elt.unsaved = true;
        };

        $scope.openSave = function () {
            $modal.open({
                animation: false,
                templateUrl: '/system/public/html/saveModal.html',
                controller: 'SaveModalCtrl',
                resolve: {
                    elt: function () {
                        return $scope.elt;
                    }
                }
            }).result.then(function () {
                $scope.save();
            });
        };
    }
]);

angular.module('systemModule').controller('SaveModalCtrl', ['$scope', 'elt', '$http',
    function ($scope, elt, $http) {

        $scope.elt = elt;
        var lastVersion;
        $scope.verifyUnicity = function () {
            lastVersion = $scope.elt.version;
            if ($scope.elt.formElements) {
                url = '/formByTinyIdAndVersion/' + $scope.elt.tinyId + "/" + $scope.elt.version;
            } else {
                url = '/deExists/' + $scope.elt.tinyId + "/" + $scope.elt.version
            }
            $http.get(url).success(function (data) {
                if (lastVersion !== $scope.elt.version) return;
                $scope.saveForm.version.$setValidity('unique', !data);
            }).error(function () {
                if (lastVersion !== $scope.elt.version) return;
                $scope.saveForm.version.$setValidity('unique', false);
            });
        };

        $scope.verifyUnicity();
    }
]);