angular.module('formModule').controller('SelectQuestionNameModalCtrl',
    ['$scope', '$uibModalInstance', '$http', 'cde', function ($scope, $modalInstance, $http, cde) {

        var url = "/debytinyid/" + cde.tinyId;
        if (cde.version) url += "/" + cde.version;
        $http.get(url).success(function (result) {
            $scope.cde = result;
        }).error(function error() {
            $scope.cde = "error";
        });

        $scope.okClear = function() {
            $modalInstance.close("");
        };

        $scope.okSelect = function (naming) {
            $modalInstance.close(naming.designation);
        };

        $scope.cancelCreate = function () {
            $modalInstance.dismiss('cancel');
        };
    }
]);