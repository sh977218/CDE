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
                        sort: '=',
                        sortby: '=',
                        properties: '=',
                        comparebasedon: '=',
                        type: '=',
                        deepcompare: '=',
                        propertiestowipe: '='
                    },
                    controller: function ($scope) {
                        $scope.getValueByNestedProperty = function (o, s) {
                            s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
                            s = s.replace(/^\./, '');           // strip a leading dot
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
                        if (($scope.sort && !$scope.sortby) || (!$scope.sort && $scope.sortby)) {
                            $scope.err = true;
                            return;
                        }
                        var leftType = Array.isArray($scope.left) === true ? 'array' : typeof $scope.left;
                        var rightType = Array.isArray($scope.right) === true ? 'array' : typeof $scope.right;
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
                        if (!$scope.sort) {
                            $scope.sort = false;
                        }
                        if (!$scope.properties) {
                            var temp = Object.keys($scope.left).forEach(function (currVal, index, arr) {
                                arr[index] = {label: currVal, property: currVal};
                                $scope.properties = arr;
                            })
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
                                if (result1.match < result2.match) {
                                    $scope.result = result1.result;
                                } else if (result1.match > result2.match) {
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
                                    $scope.result = result1;
                                }
                            }
                        }
                        else {
                            $scope.result = result1;
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
                deepCopy: function (o) {
                    return JSON.parse(JSON.stringify(o));
                },
                wipeUseless: function (o, $scope) {
                    $scope.propertiestowipe.forEach(function (p) {
                        delete o[p];
                    })
                },
                compareImpl: function ($scope, l, r) {
                    var match = 0;
                    var leftObj = this.deepCopy(l);
                    var rightObj = this.deepCopy(r);
                    var result = [];
                    if ($scope.type === 'array') {
                        if ($scope.sort) {
                            this.sortByProperty(leftObj, $scope.sortby);
                            this.sortByProperty(rightObj, $scope.sortby);
                        }
                        var rightIds = rightObj.map(function (o) {
                            this.wipeUseless(o, $scope);
                            if (!$scope.comparebasedon) {
                                return JSON.stringify(o);
                            } else {
                                return this.getValueByNestedProperty(o, $scope.comparebasedon);
                            }
                        });
                        var leftIndex = 0;
                        var beginIndex = 0;
                        leftObj.forEach(function (o) {
                            var id = JSON.stringify(o);
                            if ($scope.comparebasedon) {
                                id = this.getValueByNestedProperty(o, $scope.comparebasedon);
                            }
                            var rightIndex = rightIds.slice(beginIndex, rightIds.length).indexOf(id);
                            // element didn't found in right list.
                            if (rightIndex === -1) {
                                // put all right list elements before this element
                                if (beginIndex === 0) {
                                    for (var m = 0; m < rightObj.length; m++) {
                                        result.push({
                                            action: "space",
                                            rightIndex: m
                                        });
                                        beginIndex++;
                                    }
                                }
                                // put this element not found
                                result.push({
                                    action: "not found",
                                    leftIndex: leftIndex
                                });
                            }
                            // element found in right list
                            else {
                                // put all right elements before matched element
                                var _beginIndex = beginIndex;
                                for (var k = 0; k < rightIndex; k++) {
                                    result.push({
                                        action: "space",
                                        rightIndex: beginIndex + rightIndex - 1
                                    });
                                    beginIndex++;
                                }
                                // put this element found
                                result.push({
                                    action: "found",
                                    leftIndex: leftIndex,
                                    rightIndex: _beginIndex + rightIndex
                                });
                                match++;
                                beginIndex++;
                            }
                            leftIndex++;
                        });
                        // if after looping left list, there are element in the right list, put all of them
                        for (var i = beginIndex; i < rightIds.length; i++)
                            result.push({
                                action: "space",
                                rightIndex: i
                            })
                        return {result: result, match: match};
                    } else if ($scope.type === 'object') {
                        for (var i = 0; i < $scope.properties.length; i++) {
                            var p = $scope.properties[i];
                            if (this.getValueByNestedProperty(leftObj, p.property) === this.getValueByNestedProperty(rightObj, p.property)) {
                                result.push({
                                    label: p.label,
                                    property: p.property,
                                    match: true
                                })
                            } else {
                                result.push({
                                    label: p.label,
                                    property: p.property,
                                    match: false
                                })
                            }
                        }
                        ;
                        return result;
                    } else if ($scope.type === 'string' || $scope.type === 'number') {
                        if (leftObj === rightObj) {
                            result.push({
                                match: true
                            })
                        } else {
                            result.push({
                                match: false
                            })
                        }
                        return result;
                    }
                },
                applyComparison: function ($scope, $element) {
                    var arrayHtml = '' +
                        '<div class="row" ng-repeat="r in result" ng-class="{\'quickBoardContentCompareDelete panel panel-danger\':r.action===\'space\'||r.action===\'not found\'}">' +
                        '   <div ng-repeat="p in properties" class="overflowHidden">' +
                        '   <div class="row quickBoardContentCompare">' +
                        '       <div class="col-xs-6 array">{{p.label}}</div>' +
                        '       <div class="col-xs-6 array">{{p.label}}</div>' +
                        '   </div>' +
                        '   <div ng-compare-side-by-side left="this.getValueByNestedProperty(left[r.leftIndex],p.property)" right="this.getValueByNestedProperty(right[r.rightIndex],p.property)"></div>' +
                            /*
                             '   <div class="col-xs-6 quickBoardContentCompareCol">' +
                             '       <div ng-if="r.action !== \'space\'" class="row quickBoardContentCompare">' +
                             '           <div class="col-xs-3 compareLabel">{{p.label}}: </div>' +
                             '           <div class="col-xs-9">' +
                             '               <a ng-if="p.link" ng-href="{{p.url+this.getValueByNestedProperty(left[r.leftIndex],p.property)}}">{{this.getValueByNestedProperty(left[r.leftIndex],p.property)}}</a>' +
                             '               <div ng-if="!p.link" ng-display-object model="this.getValueByNestedProperty(left[r.leftIndex],p.property)"></div>' +
                             '           </div>' +
                             '       </div>' +
                             '   <hr class="divider compare-divider">' +
                             '   </div>' +
                             '   <div class="col-xs-6 quickBoardContentCompareCol">' +
                             '       <div ng-if="r.action !== \'not found\'" class="row quickBoardContentCompare">' +
                             '           <div class="col-xs-3 compareLabel">{{p.label}}: </div>' +
                             '           <div class="col-xs-9">' +
                             '               <a ng-if="p.link" ng-href="{{p.url+this.getValueByNestedProperty(right[r.rightIndex],p.property)}}">{{this.getValueByNestedProperty(left[r.rightIndex],p.property)}}</a>' +
                             '               <div ng-if="!p.link" ng-display-object model="this.getValueByNestedProperty(right[r.rightIndex],p.property)"></div>' +
                             '           </div>' +
                             '       </div>' +
                             '   <hr class="divider compare-divider">' +
                             '   </div>' +
                             */
                        '   </div>' +
                        '</div>';

                    var objectHtml = '' +
                        '<div class="row" ng-repeat="r in result" ng-class="{\'quickBoardContentCompareDelete\':r.match===false}">' +
                        '   <div class="row quickBoardContentCompare">' +
                        '       <div class="col-xs-6 object">{{r.label}}</div>' +
                        '       <div class="col-xs-6 object">{{r.label}}</div>' +
                        '   </div>' +
                        '   <div ng-compare-side-by-side left="this.getValueByNestedProperty(left, r.property)" right="this.getValueByNestedProperty(right, r.property)"></div>' +
                        '</div>';

                    var stringHtml = '' +
                        '<div class="row" ng-repeat="r in result" ng-class="{\'quickBoardContentCompareDelete\':r.match===false}">' +
                        '   <div class="col-xs-6 quickBoardContentCompareCol">{{left}}</div>' +
                        '   <div class="col-xs-6 quickBoardContentCompareCol">{{right}}</div>' +
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
                    if ($scope.type === 'array')
                        el = angular.element(arrayHtml);
                    else if ($scope.type === 'object')
                        el = angular.element(objectHtml);
                    else if ($scope.type === 'string' || $scope.type === 'number')
                        el = angular.element(stringHtml);
                    $compile(el)($scope);
                    $element.append(el);
                }
            };
        }])
}());