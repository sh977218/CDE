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
                function displayedAttributes(a, b, noMatchArray) {
                    if (a.o == null) return ["all"];
                    var leftDisplayAttributes = [];
                    var rightDisplayAttributes = [];
                    if (a != null) {
                        leftDisplayAttributes = options.properties.filter(function (p) {
                            var pValue = p.getProperty(a);
                            return pValue != null && pValue.length !== 0;
                        });
                    }
                    if (b == null) {
                        var b = noMatchArray.find(function (elem) {
                            return elem.calculated.tinyId === a.calculated.tinyId;
                        });
                    }
                    if (b != null) {
                        rightDisplayAttributes = options.properties.filter(function (p) {
                            var pValue = p.getProperty(b);
                            return pValue != null && pValue.length !== 0;
                        });
                    }
                    leftDisplayAttributes = leftDisplayAttributes.map(function (p) {
                        return p.property;
                    });
                    rightDisplayAttributes = rightDisplayAttributes.map(function (p) {
                        return p.property;
                    });
                    rightDisplayAttributes.forEach(function(value){
                        if (leftDisplayAttributes.indexOf(value)==-1) leftDisplayAttributes.push(value);
                    });
                    return leftDisplayAttributes;
                }
                function partialMatchAttributes(a, noMatchArray) {
                    if (a.calculated && a.calculated.tinyId) {
                        var b = noMatchArray.find(function (elem) {
                            return elem.calculated.tinyId === a.calculated.tinyId;
                        });
                    }
                    var partialMatchItems = [];
                    if (b) {
                        options.properties.forEach(function (p) {
                            if (!angular.equals(p.getProperty(a), p.getProperty(b))) {
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
                    //var displayAttribute;
                    var foundInRight = findIndexInArray(rightArray, beginRightIndex, leftItem, options.equal);
                    if (foundInRight === -1) {
                        // left only iterated
                        //displayAttribute = leftItem != null && leftItem !== '';
                        options.showTitle = true;
                        options.results.push({
                            leftIndex: leftIndex,
                            match: false,
                            displayedAttributes: displayedAttributes(leftItem, null, rightArray),
                            partialMatchItems: partialMatchAttributes(leftItem, rightArray)
                        });
                    } else {
                        // right only before
                        options.matchCount++;
                        for (var i = beginRightIndex; i < foundInRight; i++) {
                            //displayAttribute = rightArray[foundInRight] != null && rightArray[foundInRight] !== '';
                            options.showTitle = true;
                            options.results.push({
                                rightIndex: i,
                                match: false,
                                displayedAttributes: displayedAttributes(rightArray[i], null, leftArray),
                                partialMatchItems: partialMatchAttributes(rightArray[i], leftArray)
                            });
                        }
                        // match
                        //displayAttribute = leftItem != null && leftItem !== '' ||
                        //    rightArray[foundInRight] != null && rightArray[foundInRight] !== '';
                        options.results.push({
                            leftIndex: leftIndex,
                            rightIndex: foundInRight,
                            match: true,
                            displayedAttributes: displayedAttributes(leftItem, rightArray[foundInRight]),
                            partialMatchItems: []
                        });
                        beginRightIndex = foundInRight + 1;
                    }
                    // right only after
                    if (leftIndex === leftArray.length - 1) {
                        for (var j = beginRightIndex; j < rightArray.length; j++) {
                            //displayAttribute = rightArray[foundInRight] != null && rightArray[foundInRight] !== '';
                            options.showTitle = true;
                            options.results.push({
                                rightIndex: j,
                                match: false,
                                displayedAttributes: displayedAttributes(rightArray[j], null, leftArray),
                                partialMatchItems: partialMatchAttributes(rightArray[j], leftArray)
                            });
                        }
                    }
                });
            }
        };
    }]);
}());