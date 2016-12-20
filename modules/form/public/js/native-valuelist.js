(function () {
    'use strict';
    angular.module('nativeValuelist', [])
        .directive("nativeValuelist", ["$compile", function ($compile) {
            return {
                restrict: "AE",
                templateUrl: '/form/public/html/nativeValueList.html',
                controller: ['$scope', function ($scope) {
                    $scope.getLabel = function (pv) {
                        return pv ? (pv.valueMeaningName ? pv.valueMeaningName : pv.permissibleValue) : '';
                    };
                    $scope.answerlist = $scope.formElement.question.answers;
                }]
            };
        }])
}());