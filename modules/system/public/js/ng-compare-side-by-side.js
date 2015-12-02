(function () {
    'use strict';
    angular.module('ngCompareSideBySide', [])
        .directive("ngCompareSideBySide", ["$compile", "Comparison",
            function ($compile, Comparison) {
                return {
                    restrict: "AE",
                    scope: {
                        left: '=',
                        right: '=',
                        option: '='
                    },
                    controller: function ($scope) {
                    },
                    link: function ($scope, $element) {
                        if (!$scope.left && !$scope.right) {
                            $scope.err = {error: true, errorMessage: "left and right are null"};
                        } else {
                            $scope.option.type = Comparison.getType($scope.left, $scope.right);
                            Comparison.initialize($scope);
                            var result1 = Comparison.compareImpl($scope.left, $scope.right, $scope.option);
                            var result2 = Comparison.compareImpl($scope.right, $scope.left, $scope.option);
                            if (result1.result && result2.result) {
                                if (result1.result.length < result2.result.length) {
                                    $scope.result = result1.result;
                                } else if (result1.result.length > result2.result.length) {
                                    Comparison.swapLeftRight($scope);
                                    result2.result.forEach(function (r) {
                                        var leftIndexCopy = r.leftIndex;
                                        r["leftIndex"] = r.rightIndex;
                                        r["rightIndex"] = leftIndexCopy;
                                        if (r.action !== 'found') {
                                            r.action = r.action === 'space' ? 'not found' : 'space';
                                        }
                                    });
                                    $scope.result = result2.result;
                                } else {
                                    if (result1.matchCount < result2.matchCount) {
                                        $scope.result = result1.result;
                                    } else if (result1.matchCount > result2.matchCount) {
                                        Comparison.swapLeftRight($scope);
                                        result2.result.forEach(function (r) {
                                            var leftIndexCopy = r.leftIndex;
                                            r["leftIndex"] = r.rightIndex;
                                            r["rightIndex"] = leftIndexCopy;
                                            if (r.action !== 'found') {
                                                r.action = r.action === 'space' ? 'not found' : 'space';
                                            }
                                        });
                                    } else {
                                        $scope.result = result1.result;
                                    }
                                }
                            } else {
                                $scope.result = result1.result;
                            }
                            Comparison.applyComparison($scope, $element);
                        }
                    }
                };
            }])
        .factory("Comparison", ["$compile", function ($compile) {
            return {
                initialize: function (scope) {
                    if (scope.left && !scope.right) {
                        var type = typeof scope.left;
                        if (type === 'object') scope.right = {};
                        else if (type === 'string') scope.right = "";
                        else if (type === 'array') scope.right = [];
                    }
                    if (!scope.left && scope.right) {
                        var type = typeof scope.right;
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
                swapLeftRight: function (scope) {
                    var temp = scope.right;
                    scope.right = scope.left;
                    scope.left = temp;
                },
                compareImpl: function (l, r, option) {
                    if (option.type === 'array') {
                        return exports.compareSideBySide.arrayCompare(l, r, option);
                    } else if (option.type === 'object') {
                        return exports.compareSideBySide.objectCompare(l, r, option);
                    } else if (option.type === 'string') {
                        return exports.compareSideBySide.stringCompare(l, r, option);
                    } else if (option.type === 'number') {
                        return exports.compareSideBySide.numberCompare(l, r, option);
                    }
                },
                getTemplateUrl: function ($scope) {
                    if ($scope.option.type === 'array')
                        return '/system/public/js/compareTemplate/compareArray.html';
                    else if ($scope.option.type === 'stringArray')
                        return '/system/public/js/compareTemplate/compareStringArray.html';
                    else if ($scope.option.type === 'object')
                        return '/system/public/js/compareTemplate/compareObject.html';
                    else if ($scope.option.type === 'string')
                        return '/system/public/js/compareTemplate/compareString.html';
                    else if ($scope.option.type === 'number')
                        return '/system/public/js/compareTemplate/compareNumber.html';
                },
                applyComparison: function ($scope, $element) {
                    var _this = this;
                    var el;
                    if (!$scope.err) {
                        el = '<div ng-include="' + _this.getTemplateUrl($scope) + '"></ng-include>';
                        $compile(el)($scope);
                        $element.append(el);
                    }
                }
            };
        }])
}());