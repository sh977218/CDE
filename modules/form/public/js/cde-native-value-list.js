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
                    $scope.answerlist = $scope.question.question.answers;
                }]
            };
        }])
}());