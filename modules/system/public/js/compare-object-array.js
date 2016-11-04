(function () {
    'use strict';
    angular.module('compareObjectArray', []).directive("compareObjectArray", ["$compile", "ObjectArrayComparison",
        function ($compile, ObjectArrayComparison) {
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
                    ObjectArrayComparison.loadDefaultOptions($scope.options);
                    ObjectArrayComparison.objectArrayCompare($scope.left, $scope.right, $scope.options);
                }
            };
        }]).factory("ObjectArrayComparison", ["$compile", function () {
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
                if (typeof options.doSort === 'undefined') options.doSort = true;
                options.matchCount = 0;
                options.results = [];
                options.showTitle = false;
            },
            objectArrayCompare: function (leftArray, rightArray, options) {
                function findIndexInArray(array, beginRightIndex, item, equalFn) {
                    if (!array || array.length === 0 || beginRightIndex === array.length)
                        return -1;
                    for (var index = beginRightIndex; index < array.length; index++) {
                        if (equalFn(item, array[index])) return index;
                    }
                    return -1;
                }
                function matchDifferentAttributes(a, noMatchArray) {
                    if (a.tinyId) {
                        var b = noMatchArray.find(function (elem) {
                            return elem.tinyId === a.tinyId;
                        });
                    }
                    var partialMatchItems = [];
                    if (b) {
                        options.properties.forEach(function (p) {
                            if (!eval(p.equal)) {
                                partialMatchItems.push(p.property);
                            }
                        });
                        if (partialMatchItems.length === 0) {
                            partialMatchItems.push("found");
                        }
                    }
                    return partialMatchItems;
                }

                if (options.doSort) {
                    leftArray.sort(options.sort);
                    rightArray.sort(options.sort);
                }

                var beginRightIndex = 0;
                leftArray.forEach(function (leftItem, leftIndex) {
                    var foundInRight = findIndexInArray(rightArray, beginRightIndex, leftItem, options.equal);
                    if (foundInRight === -1) {
                        // left only iterated
                        var partialMatchItems = matchDifferentAttributes(leftItem, rightArray);
                        options.showTitle = true;
                        options.results.push({leftIndex: leftIndex, match: false, partialMatchItems: partialMatchItems});
                    } else {
                        // right only before
                        options.matchCount++;
                        for (var i = beginRightIndex; i < foundInRight; i++) {
                            var partialMatchItems = matchDifferentAttributes(rightArray[i], leftArray);
                            options.showTitle = true;
                            options.results.push({rightIndex: i, match: false, partialMatchItems: partialMatchItems});
                        }
                        // match
                        options.results.push({
                            leftIndex: leftIndex,
                            rightIndex: foundInRight,
                            match: true
                        });
                        beginRightIndex = foundInRight + 1;
                    }
                    // right only after
                    if (leftIndex === leftArray.length - 1) {
                        for (var j = beginRightIndex; j < rightArray.length; j++) {
                            var partialMatchItems = matchDifferentAttributes(rightArray[j], leftArray);
                            options.showTitle = true;
                            options.results.push({rightIndex: j, match: false, partialMatchItems: partialMatchItems});
                        }
                    }
                });
            }
        };
    }]);
}());