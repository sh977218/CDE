angular.module('formModule').controller('SelectQuestionNameModalCtrl',
    ['$scope', '$uibModalInstance', '$http', 'cde', 'form',
        function ($scope, $modalInstance, $http, cde, form) {

            var url = "/debytinyid/" + cde.tinyId;
            if (cde.version) url += "/" + cde.version;
            $http.get(url).success(function (result) {
                $scope.cde = result;
            }).error(function error() {
                $scope.cde = "error";
            });

            $scope.okSelect = function (naming) {
                if (!naming) naming = "";
                $modalInstance.close(naming.designation);
            };
        }
    ]);