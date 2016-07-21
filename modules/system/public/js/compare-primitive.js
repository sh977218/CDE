(function () {
    'use strict';
    angular.module('comparePrimitive', []).directive("comparePrimitive", ["$compile", "PrimitiveComparison",
        function ($compile, PrimitiveComparison) {
            return {
                restrict: "E",
                scope: {
                    left: '=left',
                    right: '=right',
                    options: '=?options'
                },
                templateUrl: '/system/public/html/compareTemplate/comparePrimitive.html',
                link: function ($scope) {
                    $scope.left = $scope.left ? $scope.left : '';
                    $scope.right = $scope.right ? $scope.right : '';
                    if (typeof  $scope.left !== 'string' || typeof $scope.right !== 'string') {
                        $scope.err = {error: true, errorMessage: "left and right are not type of string"};
                    }
                    if (!$scope.options) $scope.options = {};
                    PrimitiveComparison.loadDefaultOptions($scope.options);
                    PrimitiveComparison.primitiveCompare($scope.left, $scope.right, $scope.options);
                }
            };
        }]).factory("PrimitiveComparison", ["$compile", function () {
        return {
            loadDefaultOptions: function (options) {
                if (!options.equal) {
                    options.equal = function (a, b) {
                        return a === b;
                    }
                }
            },
            primitiveCompare: function (leftString, rightString, options) {
                options.matchCount = 0;
                options.showTitle = false;
                options.result = {};
                if (options.equal(leftString, rightString)) {
                    options.matchCount++;
                    options.result.match = true;
                } else {
                    options.showTitle = true;
                    options.result.match = false;
                }
            }
        };
    }])
}());