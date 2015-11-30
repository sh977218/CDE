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
                        $scope.getValueByNestedProperty = function (o, s) {
                            if (!o) return "";
                            // convert indexes to properties
                            s = s.replace(/\[(\w+)\]/g, '.$1');
                            // strip a leading dot
                            s = s.replace(/^\./, '');
                            var a = s.split('.');
                            for (var i = 0, n = a.length; i < n; ++i) {
                                var k = a[i];
                                if (k in o) {
                                    o = o[k];
                                } else {
                                    return;
                                }
                            }
                            return o;
                        }
                    },
                    link: function ($scope, $element) {
                        if (!$scope.left && !$scope.right) {
                            $scope.err = true;
                            return;
                        }
                        var leftType = Array.isArray($scope.left) === true ? 'array' : typeof $scope.left;
                        var rightType = Array.isArray($scope.right) === true ? 'array' : typeof $scope.right;
                        if (leftType === 'undefined' && rightType !== 'undefined') {
                            leftType = rightType;
                        }
                        if (rightType === 'undefined' && leftType !== 'undefined') {
                            rightType = leftType;
                        }
                        if (leftType !== rightType) {
                            $scope.err = true;
                            return;
                        }
                        $scope.type = leftType;
                        if (!$scope.left) {
                            if (leftType === 'object') {
                                $scope.left = {};
                            }
                            else if (leftType === 'string') {
                                $scope.left = "";
                            } else if (leftType === 'array') {
                                $scope.left = [];
                            }
                        }
                        if (!$scope.right) {
                            if (rightType === 'object') {
                                $scope.right = {};
                            }
                            else if (rightType === 'string') {
                                $scope.right = "";
                            }
                            else if (rightType === 'array') {
                                $scope.right = [];
                            }
                        }
                        if ($scope.type === 'array' && $scope.left.length === 0 && $scope.right.length === 0) {
                            $scope.err = true;
                            return;
                        }
                        if (!$scope.sortIt) {
                            $scope.sortIt = false;
                        }
                        if (!$scope.properties) {
                            var leftProperty = [];
                            var rightProperty = [];
                            if ($scope.type === 'object') {
                                {
                                    if ($scope.left)
                                        Object.keys($scope.left).forEach(function (o) {
                                            leftProperty.push({label: o, property: o});
                                        });
                                    if ($scope.right)
                                        Object.keys($scope.right).forEach(function (o) {
                                            rightProperty.push({label: o, property: o});
                                        });
                                }
                            } else if ($scope.type === 'array') {
                                if ($scope.left && $scope.left.length > 0)
                                    Object.keys($scope.left[0]).forEach(function (o) {
                                        leftProperty.push({label: o, property: o});
                                    });
                                if ($scope.right && $scope.right.length > 0)
                                    Object.keys($scope.right[0]).forEach(function (o) {
                                        rightProperty.push({label: o, property: o});
                                    });
                            }
                            $scope.properties = leftProperty.length >= rightProperty.length ? leftProperty : rightProperty;
                        }
                        var result1 = Comparison.compareImpl($scope, $scope.left, $scope.right);
                        var result2 = Comparison.compareImpl($scope, $scope.right, $scope.left);
                        if (result1.result && result2.result) {
                            if (result1.result.length < result2.result.length) {
                                $scope.result = result1.result;
                            } else if (result1.result.length > result2.result.length) {
                                Comparison.swap($scope.left, $scope.right);
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
                                    Comparison.swap($scope.left, $scope.right);
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
                        }
                        else {
                            $scope.result = result1.result;
                        }
                        Comparison.applyComparison($scope, $element);
                    }
                };
            }])
        .factory("Comparison", ["$compile", function ($compile) {
            return {
                swap: function (l, r) {
                    var lCopy = l;
                    l = r;
                    r = lCopy;
                },
                getValueByNestedProperty: function (o, s) {
                    if (!o) return "";
                    // convert indexes to properties
                    s = s.replace(/\[(\w+)\]/g, '.$1');
                    // strip a leading dot
                    s = s.replace(/^\./, '');
                    var a = s.split('.');
                    for (var i = 0, n = a.length; i < n; ++i) {
                        var k = a[i];
                        if (k in o) {
                            o = o[k];
                        } else {
                            return;
                        }
                    }
                    return o;
                },
                sortByProperty: function (o, sortby) {
                    o.sort(function (a, b) {
                        if (this.getValueByNestedProperty(a, sortby) < this.getValueByNestedProperty(b.sortby)) {
                            return -1;
                        }
                        else if (this.getValueByNestedProperty(a, sortby) > this.getValueByNestedProperty(b.sortby)) {
                            return 1;
                        }
                        else return 0;
                    })
                },
                compareImpl: function ($scope, l, r) {
                    if ($scope.type === 'array') {
                        return exports.compareSideBySide.arrayCompare($scope.left, $scope.right, $scope.option);
                    } else if ($scope.type === 'object') {
                        return exports.compareSideBySide.objectCompare($scope.left, $scope.right, $scope.option);
                    } else if ($scope.type === 'string') {
                        return exports.compareSideBySide.stringCompare($scope.left, $scope.right, $scope.option);
                    } else if ($scope.type === 'number') {
                        return exports.compareSideBySide.numberCompare($scope.left, $scope.right, $scope.option);
                    }
                },
                applyComparison: function ($scope, $element) {
                    var arrayHtml = '' +
                        '<div class="quickBoardArraySeparate" ng-repeat="r in result" ng-class="{quickBoardContentCompareModifiedArray:r.action===\'space\'||r.action===\'not found\',quickBoardContentCompareSameArray:r.action===\'found\'}">' +
                        '   <div class="overflowHidden" ng-repeat="p in option.properties">' +
                        '       <div class="col-xs-6 quickBoardContentCompareCol leftObj" ng-display-object obj="left[r.leftIndex]" properties="p" showwarningicon="r.action ===\'found\'"></div>' +
                        '       <div class="col-xs-6 quickBoardContentCompareCol rightObj" ng-display-object obj="right[r.rightIndex]" properties="p" showwarningicon="r.action ===\'found\'"></div>' +
                        '   </div>' +
                        '</div>';

                    var objectHtml = '' +
                        '<div class="overflowHidden" ng-repeat="r in result" ng-class="{quickBoardContentCompareModifiedObject:r.match===false,quickBoardContentCompareSameObject:r.match===true}">' +
                        '   <div class="col-xs-6 quickBoardContentCompareCol leftObj" ng-display-object obj="left" properties="r"></div>' +
                        '   <div class="col-xs-6 quickBoardContentCompareCol rightObj" ng-display-object obj="right" properties="r"></div>' +
                        '</div>';

                    var stringHtml = '' +
                        '<div class="row" ng-repeat="r in result" ng-class="{\'quickBoardContentCompareModified\':r.match===false}">' +
                        '   <div class="col-xs-6 quickBoardContentCompareCol">{{left}}</div>' +
                        '   <div class="col-xs-6 quickBoardContentCompareCol">{{right}}</div>' +
                        '</div>';

                    var stringArrayHtml = '' +
                        '<div class="row" ng-repeat="r in result" ng-class="{\'quickBoardContentCompareModified\':r.match===false}">' +
                        '   <div class="col-xs-6 quickBoardContentCompareCol">{{left[r.leftIndex]}}</div>' +
                        '   <div class="col-xs-6 quickBoardContentCompareCol">{{right[r.rightIndex]}}</div>' +
                        '</div>';

                    var errorHtml = '' +
                        '<div class="row">there is errors</div>';

                    var el;
                    if ($scope.err) {
                        el = angular.element(errorHtml);
                        $compile(el)($scope);
                        $element.append(el);
                        return;
                    }
                    if ($scope.type === 'array' && !$scope.stringArray)
                        el = angular.element(arrayHtml);
                    else if ($scope.type === 'array' && $scope.stringArray)
                        el = angular.element(stringArrayHtml);
                    else if ($scope.type === 'object')
                        el = angular.element(objectHtml);
                    else
                        el = angular.element(stringHtml);
                    $compile(el)($scope);
                    $element.append(el);
                }
            };
        }])
}());