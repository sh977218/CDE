(function () {
    'use strict';
    angular.module('compareObject', []).directive("compareObject", ["$compile", "ObjectComparison",
        function ($compile, ObjectComparison) {
            return {
                restrict: "E",
                scope: {
                    left: '=left',
                    right: '=right',
                    options: '=?options'
                },
                templateUrl: '/system/public/html/compareTemplate/compareObject.html',
                link: function ($scope) {
                    $scope.left = $scope.left ? $scope.left : {};
                    $scope.right = $scope.right ? $scope.right : {};
                    if (!$scope.options) $scope.options = {};
                    ObjectComparison.loadDefaultOptions($scope.options);
                    ObjectComparison.objectCompare($scope.left, $scope.right, $scope.options);
                }
            };
        }]).factory("ObjectComparison", ["$compile", function () {
        return {
            loadDefaultOptions: function (options) {
                if (!options.equal) {
                    options.equal = function (a, b) {
                        return a === b;
                    };
                }
                if (!options.sort) {
                    options.sort = function (a, b) {
                        return a - b;
                    };
                }
            },
            objectCompare: function (leftObj, rightObj, options) {
                options.matchCount = 0;
                options.showTitle = false;
                options.results = [];
                if (options.properties) {
                    options.properties.forEach(function (p) {
                        if (leftObj[p.property] === rightObj[p.property]) {
                            options.matchCount++;
                            options.results.push({label: p.label, property: p.property, match: true});
                        } else {
                            options.showTitle = true;
                            options.results.push({label: p.label, property: p.property, match: false});
                        }
                    });
                }
            }
        };
    }]);
}());