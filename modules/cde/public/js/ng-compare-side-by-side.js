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
                        properties: '=',
                        question: '=',
                        type: '='
                    },
                    controller: function ($scope, $element) {
                        $scope.getProperty = function (o, s) {
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
                        if (!$scope.left)
                            if ($scope.type === 'object')
                                $scope.left = {};
                            else
                                $scope.left = [];
                        if (!$scope.right)
                            if ($scope.type === 'object')
                                $scope.right = {};
                            else
                                $scope.right = [];
                        var leftObj = Comparison.deepCopy($scope.left);
                        var rightObj = Comparison.deepCopy($scope.right);
                        if (Array.isArray($scope.left) && Array.isArray($scope.right)) {
                            if ($scope.sort) {
                                Comparison.sortByName(leftObj);
                                Comparison.sortByName(rightObj);
                            }
                            var leftIds = leftObj.map(function (o) {
                                Comparison.wipeUseless(o);
                                if ($scope.question) {
                                    return o.question.cde.tinyId;
                                }
                                else
                                    return JSON.stringify(o);
                            });
                            var rightIds = rightObj.map(function (o) {
                                Comparison.wipeUseless(o);
                                if ($scope.question) {
                                    return o.question.cde.tinyId;
                                }
                                else
                                    return JSON.stringify(o);
                            });
                            var result = [];
                            var leftIndex = 0;
                            var beginIndex = 0;
                            leftObj.forEach(function (o) {
                                var id = JSON.stringify(o);
                                if ($scope.question) {
                                    id = o.question.cde.tinyId;
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
                            $scope.result = result;
                        } else if (typeof $scope.left === 'object' && typeof $scope.right === 'object') {
                            var diff = DeepDiff(leftObj, rightObj);
                            if (diff && diff.length > 0) {
                                $scope.result = diff;
                            }
                        }
                        Comparison.applyComparison($scope, $element);
                    }
                };
            }])
        .factory("Comparison", ["$compile", function ($compile) {
            return {
                sortByName: function (o) {
                    if (Array.isArray(o))
                        o.sort();
                },
                deepCopy: function (o) {
                    return JSON.parse(JSON.stringify(o));
                },
                wipeUseless: function (o) {
                    delete o._id;
                    delete o.__v;
                    delete o.history;
                    delete o.imported;
                    delete o.noRenderAllowed;
                    delete o.displayProfiles;
                    delete o.attachments;
                    delete o.version;
                    delete o.comments;
                    delete o.tinyId;
                    delete o.derivationRules;
                    delete o.usedBy;
                    delete o.classification;
                    delete o.$$hashKey;
                    delete o.isOpen;
                    delete o.formElements;
                },
                applyComparison: function ($scope, $element) {
                    var arrayHtml = '' +
                        '<div class="row" ng-repeat="r in result" ng-class="{quickBoardContentCompareDelete:r.action===\'space\'||r.action===\'not found\'}">' +
                        '   <div class="col-xs-6">' +
                        '       <div ng-if="r.action !== \'space\'" ng-repeat="p in properties" class="row quickBoardContentCompare">' +
                        '           <div class="col-xs-3 compareLabel">{{p.label}}: </div>' +
                        '           <div class="col-xs-9">{{this.getProperty(left[r.leftIndex],p.property)}}</div>' +
                        '       </div>' +
                        '   </div>' +
                        '   <div class="col-xs-6">' +
                        '       <div ng-if="r.action !== \'not found\'" ng-repeat="p in properties" class="row quickBoardContentCompare">' +
                        '           <div class="col-xs-3 compareLabel">{{p.label}}: </div>' +
                        '           <div class="col-xs-9">{{this.getProperty(right[r.rightIndex],p.property)}}</div>' +
                        '       </div>' +
                        '   </div>' +
                        '</div>' +
                        '<hr class="divider">';

                    var objectHtml = '' +
                        '<div class="row">' +
                        '   <div class="col-xs-6">' +
                        '       <div class="row quickBoardContentCompare" ng-repeat="p in properties">' +
                        '           <div class="col-xs-3 compareLabel">{{p.label}}:</div>' +
                        '           <div class="col-xs-9">{{this.getProperty(left, p.property)}}</div>' +
                        '       </div>' +
                        '   </div>' +
                        '   <div class="col-xs-6">' +
                        '       <div class="row quickBoardContentCompare" ng-repeat="p in properties">' +
                        '           <div class="col-xs-3 compareLabel">{{p.label}}:</div>' +
                        '           <div class="col-xs-9">{{this.getProperty(right, p.property)}}</div>' +
                        '       </div>' +
                        '   </div>' +
                        '</div>' +
                        '<hr class="divider">';
                    var el;
                    if ($scope.type === 'array')
                        el = angular.element(arrayHtml);
                    else if ($scope.type === 'object')
                        el = angular.element(objectHtml);
                    $compile(el)($scope);
                    $element.append(el);
                }
            };
        }])
}());