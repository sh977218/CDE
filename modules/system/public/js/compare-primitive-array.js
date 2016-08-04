(function () {
    'use strict';
    angular.module('comparePrimitiveArray', []).directive("comparePrimitiveArray", ["$compile", "PrimitiveArrayComparison",
        function ($compile, PrimitiveComparison) {
            return {
                restrict: "E",
                scope: {
                    left: '=left',
                    right: '=right',
                    options: '=?options'
                },
                templateUrl: '/system/public/html/compareTemplate/comparePrimitiveArray.html',
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
        }]).factory("PrimitiveArrayComparison", ["$compile", function () {
        return {
            loadDefaultOptions: function (options) {
                if (!options.equal) {
                    options.equal = function (a, b) {
                        return a === b;
                    };
                }
                if (!options.sort) {
                    options.sort = function (a, b) {
                        return a.localeCompare(b);
                    };
                }
                options.matchCount = 0;
                options.results = [];
                options.showTitle = false;
            },
            primitiveArrayCompare: function (leftArray, rightArray, options) {
                function findIndexInArray(array, beginRightIndex, item) {
                    if (!array || array.length === 0 || beginRightIndex === array.length)
                        return -1;
                    for (var index = beginRightIndex; index < array.length; index++) {
                        if (item === array[index]) return index;
                    }
                    return -1;
                }
                leftArray.sort(options.sort);
                rightArray.sort(options.sort);

                var beginRightIndex = 0;
                leftArray.forEach(function (leftItem, leftIndex) {
                    var foundInRight = findIndexInArray(rightArray, beginRightIndex, leftItem);
                    if (foundInRight === -1) {
                        options.showTitle = true;
                        options.results.push({leftIndex: leftIndex, match: false});
                    } else {
                        options.matchCount++;
                        for (var i = beginRightIndex; i < foundInRight; i++) {
                            options.showTitle = true;
                            options.results.push({rightIndex: i, match: false});
                        }
                        options.results.push({
                            leftIndex: leftIndex,
                            rightIndex: foundInRight,
                            match: true
                        });
                        beginRightIndex = foundInRight + 1;
                    }
                    if (leftIndex === leftArray.length - 1) {
                        for (var j = beginRightIndex; j < rightArray.length; j++) {
                            options.showTitle = true;
                            options.results.push({rightIndex: j, match: false});
                        }
                    }
                });
            }
        };
    }]);
}());