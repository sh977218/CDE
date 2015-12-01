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
                            Comparison.applyComparison($scope, $element);
                        } else {
                            $scope.option.type = Comparison.getType($scope.left, $scope.right);
                            // TODO Fix
                            //Comparison.checkIfEmpty($scope.left);
                            //Comparison.checkIfEmpty($scope.right);
                            var result1 = Comparison.compareImpl($scope.left, $scope.right, $scope.option);
                            var result2 = Comparison.compareImpl($scope.right, $scope.left, $scope.option);
                            if (result1.result && result2.result) {
                                if (result1.result.length < result2.result.length) {
                                    $scope.result = result1.result;
                                } else if (result1.result.length > result2.result.length) {
                                    // @TODO fix
                                    //Comparison.swap($scope.left, $scope.right);
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
                                        // @TODO
                                        //Comparison.swap($scope);
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
                //checkIfEmpty: function (o) {
                //    if (o) {
                //        var type = typeof o;
                //        if (type === 'object') o = {};
                //        else if (type === 'string') o = "";
                //        else if (type === 'array') o = [];
                //    }
                //},
                getType: function (l, r) {
                    var leftType = Array.isArray(l) === true ? 'array' : typeof l;
                    var rightType = Array.isArray(r) === true ? 'array' : typeof r;
                    if (leftType !== rightType) {
                    } else if (leftType === 'array' && (typeof l[0] === 'string' || typeof r[0] === 'string')) return 'stringArray';
                    else return leftType;
                },
                //swap: function (s) {
                //    var temp = s.right;
                //    s.right = s.left;
                //    s.left = temp;
                //},
                //swap: function (l, r) {
                //    var lCopy = l;
                //    l = r;
                //    r = lCopy;
                //},
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
                applyComparison: function ($scope, $element) {
                    var arrayHtml = '' +
                        '<div class="quickBoardArraySeparate quickBoardContentCompareArray" ng-repeat="r in result" ng-class="{quickBoardContentCompareModifiedArray:r.action===\'space\'||r.action===\'not found\',quickBoardContentCompareSameArray:r.action===\'found\'}">' +
                        '   <div class="overflowHidden" ng-repeat="p in option.properties">' +
                        '       <div class="col-xs-6 quickBoardContentCompareCol leftObj" ng-display-object obj="left[r.leftIndex]" properties="p" show-warning-icon="r.action ===\'found\'"></div>' +
                        '       <div class="col-xs-6 quickBoardContentCompareCol rightObj" ng-display-object obj="right[r.rightIndex]" properties="p" show-warning-icon="r.action ===\'found\'"></div>' +
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

                    var numberHtml = '' +
                        '<div class="row" ng-repeat="r in result" ng-class="{\'quickBoardContentCompareModified\':r.match===false}">' +
                        '   <div class="col-xs-6 quickBoardContentCompareCol">{{left}}</div>' +
                        '   <div class="col-xs-6 quickBoardContentCompareCol">{{right}}</div>' +
                        '</div>';

                    var stringArrayHtml = '' +
                        '<div class="row" ng-repeat="r in result" ng-class="{\'quickBoardContentCompareModified\':r.match===false}">' +
                        '   <div class="col-xs-6 quickBoardContentCompareCol">{{left[r.leftIndex]}}</div>' +
                        '   <div class="col-xs-6 quickBoardContentCompareCol">{{right[r.rightIndex]}}</div>' +
                        '</div>';

                    var el;
                    if ($scope.err) return;
                    else if ($scope.option.type === 'array')
                        el = angular.element(arrayHtml);
                    else if ($scope.option.type === 'stringArray')
                        el = angular.element(stringArrayHtml);
                    else if ($scope.option.type === 'object')
                        el = angular.element(objectHtml);
                    else if ($scope.option.type === 'string')
                        el = angular.element(stringHtml);
                    else if ($scope.option.type === 'number')
                        el = angular.element(numberHtml);
                    $compile(el)($scope);
                    $element.append(el);
                }
            };
        }])
}());