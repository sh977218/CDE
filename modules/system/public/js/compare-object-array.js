(function () {
    'use strict';
    angular.module('compareObjectArray', []).directive("compareObjectArray", ["$compile", "ObjectArrayComparison",
        function ($compile, PrimitiveComparison) {
            return {
                restrict: "E",
                scope: {
                    left: '=left',
                    right: '=right',
                    options: '=?options'
                },
                templateUrl: '/system/public/html/compareTemplate/compareObjectArray.html',
                link: function ($scope) {
                    $scope.left = $scope.left ? $scope.left : [];
                    $scope.right = $scope.right ? $scope.right : [];
                    if (!Array.isArray($scope.left) || !Array.isArray($scope.right)) {
                        $scope.err = {error: true, errorMessage: "left and right are not type of array"};
                    }
                    if (!$scope.options) $scope.options = {};
                    PrimitiveComparison.loadDefaultOptions($scope.options);
                    PrimitiveComparison.primitiveArrayCompare($scope.left, $scope.right, $scope.options);
                }
            };
        }]).factory("ObjectArrayComparison", ["$compile", function () {
        return {
            loadDefaultOptions: function (options) {
                if (!options.equal) {
                    options.equal = function (a, b) {
                        return a === b;
                    }
                }
                if (!options.sort) {
                    options.sort = function (a, b) {
                        return a.localeCompare(b);
                    }
                }
            },
            primitiveArrayCompare: function (leftArray, rightArray, options) {
                options.matchCount = 0;
                options.results = [];
                options.showTitle = false;

                leftArray.sort(options.sort);
                rightArray.sort(options.sort);

                var rightArrayCopy = angular.copy(rightArray);
                var beginRightIndex = 0;
                leftArray.forEach(function (leftItem, leftIndex) {
                    rightArrayCopy = rightArray.slice(beginRightIndex, rightArray.length);
                    var foundInRight = rightArrayCopy.indexOf(leftItem);
                    if (foundInRight === -1) {
                        options.showTitle = true;
                        options.results.push({leftIndex: leftIndex, match: false});
                        if (leftIndex === leftArray.length - 1) {
                            for (var j = 0; j < rightArrayCopy.length; j++) {
                                options.results.push({rightIndex: j + beginRightIndex, match: false});
                            }
                        }
                    } else {
                        options.matchCount++;
                        for (var i = 0; i < foundInRight; i++) {
                            options.results.push({rightIndex: i + beginRightIndex, match: false});
                        }
                        options.results.push({
                            leftIndex: leftIndex,
                            rightIndex: foundInRight + beginRightIndex,
                            match: true
                        });
                        beginRightIndex = beginRightIndex + foundInRight + 1;
                    }
                });
            }
        };
    }])
}());