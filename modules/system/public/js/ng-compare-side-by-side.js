(function () {
    'use strict';
    angular.module('ngCompareSideBySide', [])
        .directive("ngCompareSideBySide", ["$compile", "Comparison",
            function ($compile, Comparison) {
                return {
                    restrict: "AE",
                    scope: {
                        left: '=ngCompareSideBySideLeft',
                        right: '=ngCompareSideBySideRight',
                        options: '=ngCompareSideBySideOptions'
                    },
                    templateUrl: '/system/public/js/compareTemplate/compareSwitchTemplate.html',
                    link: function ($scope) {
                        if (!$scope.left && !$scope.right) {
                            $scope.err = {error: true, errorMessage: "left and right are null"};
                        } else {
                            $scope.options.type = Comparison.getType($scope.left, $scope.right);
                            Comparison.initialize($scope);
                            var result1 = Comparison.compareImpl($scope.left, $scope.right, $scope.options);
                            var result2 = Comparison.compareImpl($scope.right, $scope.left, $scope.options);
                            if (result1.result && result2.result) {
                                if (result1.result.length < result2.result.length) {
                                    $scope.result = result1.result;
                                } else if (result1.result.length > result2.result.length) {
                                    Comparison.swapIndex(result2);
                                    $scope.result = result2.result;
                                } else {
                                    if (result1.matchCount < result2.matchCount) {
                                        $scope.result = result1.result;
                                    } else if (result1.matchCount > result2.matchCount) {
                                        Comparison.swapIndex(result2);
                                    } else {
                                        $scope.result = result1.result;
                                    }
                                }
                            } else {
                                $scope.result = result1.result;
                            }
                            $scope.displayTemplate = {
                                array: '/system/public/js/compareTemplate/compareArray.html',
                                stringArray: '/system/public/js/compareTemplate/compareStringArray.html',
                                object: '/system/public/js/compareTemplate/compareObject.html',
                                string: '/system/public/js/compareTemplate/compareString.html',
                                number: '/system/public/js/compareTemplate/compareNumber.html'
                            }[$scope.options.type];
                        }
                    }
                };
            }])
        .factory("Comparison", ["$compile", function () {
            return {
                initialize: function (scope) {
                    var type;
                    if (scope.left && !scope.right) {
                        type = typeof scope.left;
                        if (type === 'object') scope.right = {};
                        else if (type === 'string') scope.right = "";
                        else if (type === 'array') scope.right = [];
                    }
                    if (!scope.left && scope.right) {
                        type = typeof scope.right;
                        if (type === 'object') scope.left = {};
                        else if (type === 'string') scope.left = "";
                        else if (type === 'array') scope.left = [];
                    }
                },
                getType: function (l, r) {
                    var leftType = Array.isArray(l) === true ? 'array' : typeof l;
                    var rightType = Array.isArray(r) === true ? 'array' : typeof r;
                    if (leftType !== rightType) {
                    } else if (leftType === 'array' && (typeof l[0] === 'string' || typeof r[0] === 'string')) return 'stringArray';
                    else return leftType;
                },
                swapIndex: function (result2) {
                    result2.result.forEach(function (r) {
                        var leftIndexCopy;
                        var rightIndexCopy;
                        if (r.leftIndex != undefined) {
                            leftIndexCopy = exports.deepCopy(r.leftIndex);
                        }
                        if (r.rightIndex != undefined) {
                            rightIndexCopy = exports.deepCopy(r.rightIndex);
                        }
                        delete r.leftIndex;
                        delete r.rightIndex;
                        if (rightIndexCopy != undefined)
                            r.leftIndex = rightIndexCopy;
                        if (leftIndexCopy != undefined)
                            r.rightIndex = leftIndexCopy;
                        if (r.found !== 'both') {
                            r.found = r.found === 'right' ? 'left' : 'right';
                        }
                    });
                },
                compareImpl: function (l, r, options) {
                    if (options.type === 'array') {
                        return exports.compareSideBySide.arrayCompare(l, r, options);
                    } else if (options.type === 'object') {
                        return exports.compareSideBySide.objectCompare(l, r, options);
                    } else if (options.type === 'string') {
                        return exports.compareSideBySide.stringCompare(l, r, options);
                    } else if (options.type === 'number') {
                        return exports.compareSideBySide.numberCompare(l, r, options);
                    }
                }
            };
        }])
}());