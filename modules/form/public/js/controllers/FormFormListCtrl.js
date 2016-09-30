angular.module('formModule').controller('FormFormListCtrl', ['$scope', '$controller',
    function ($scope, $controller) {

        $controller('FormDEListCtrl', {$scope: $scope});

        $scope.termSearch = function () {
            $scope.reload("form");
        };
    }]);
