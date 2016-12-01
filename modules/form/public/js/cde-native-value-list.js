(function () {
    'use strict';
    angular.module('cdeNativeValueList', [])
        .directive("cdeNativeValueList", ["$compile", function ($compile) {
            return {
                restrict: "AE",
                templateUrl: '/form/public/html/nativeValueList.html',
                controller: ['$scope', function ($scope) {
                    $scope.getLabel = function (pv) {
                        return pv ? (pv.valueMeaningName ? pv.valueMeaningName : pv.permissibleValue) : '';
                    };
                    $scope.is1column = function (pv) {
                        return $scope.getLabel(pv).length <= 17;
                    };
                    $scope.is2column = function (pv) {
                        return $scope.getLabel(pv).length > 17 && $scope.getLabel(pv).length <= 38;
                    }
                }]
            };
        }])
}());