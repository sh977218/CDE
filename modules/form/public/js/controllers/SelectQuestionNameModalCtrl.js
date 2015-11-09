angular.module('formModule').controller('SelectQuestionNameModalCtrl',
    ['$scope', '$modalInstance', '$http', 'cde', function ($scope, $modalInstance, $http, cde) {

        var url = "/debytinyid/" + cde.tinyId;
        if (cde.version) url += "/" + cde.version;
        $http.get(url).success(function (result) {
            $scope.cde = result;
        }).error(function error(err) {
            $scope.cde = "error";
        });

        $scope.okSelect = function (naming) {
            $modalInstance.close(naming.designation);
        };

        $scope.cancelCreate = function () {
            $modalInstance.dismiss('cancel');
        };
    }
]);