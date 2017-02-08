(function () {
    'use strict';
    angular.module('ngDisplayObject', [])
        .directive("ngDisplayObject", ["$compile", "Display",
            function ($compile, Display) {
                return {
                    restrict: "AE",
                    scope: {
                        obj: '=ngDisplayObjectObj',
                        properties: '=ngDisplayObjectProperties',
                        showAttribute: '=ngDisplayObjectShowAttribute',
                        showWarningIcon: '=ngDisplayObjectShowWarningIcon'
                    },
                    controller: ["$scope", function ($scope) {
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
                        };
                    }],
                    link: function ($scope, $element) {
                        if (!$scope.obj) return;
                        else $scope.type = typeof $scope.obj;
                        Display.applyHtml($scope, $element);
                    }
                };
            }])
        .factory("Display", ["$compile", function ($compile) {
            return {
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
                            return "";
                        }
                    }
                    if (typeof o === 'boolean') return (o ? 'Yes' : 'No');
                    if (typeof o === 'number') return o.toString();
                    if (o.constructor === Array) {
                        return o.map(function (m) {
                            return m.tag;
                        }).join(', ');
                    }
                    return o;
                },
                applyHtml: function ($scope, $element) {
                    if (typeof $scope.showAttribute !== 'undefined' && !$scope.showAttribute) return;
                    var propertyValue = this.getValueByNestedProperty($scope.obj, $scope.properties.property);
                    $scope.value = "";
                    $scope.type = typeof propertyValue;
                    if ($scope.type === "string") $scope.value = propertyValue;
                    if (Array.isArray(propertyValue) && propertyValue && propertyValue[0] &&
                        typeof propertyValue[0] === 'string')
                        $scope.value = propertyValue;
                    if ($scope.properties.displayAs && Array.isArray(propertyValue) && propertyValue &&
                        propertyValue[0] && typeof propertyValue[0] === 'object')
                        $scope.value = propertyValue.map(function (o) {
                            return "<p>" + o[$scope.properties.displayAs] + "</p>";
                        }).join("");
                    var objectHtml = '<div class="row" ng-class="{quickBoardContentCompareDiff:showWarningIcon &&' +
                        ' properties.match===false,quickBoardContentCompareSame:properties.match === true,' +
                        ' quickBoardContentCompareDiff:showWarningIcon}">' +
                        '<div class="col-xs-4 {{properties.label}}">{{properties.label}}:</div>' +
                        '<div ng-if="properties.link" class="col-xs-7" data-title="{{properties.property}}">' +
                        ' <a ng-href="{{properties.url}}' + propertyValue + '">' + propertyValue + '</a></div>' +
                        '<div ng-if="!properties.link" class="col-xs-7" data-title="{{properties.property}}"' +
                        ' ng-bind-html="value" ng-text-truncate="value" ng-tt-threshold="100"></div>';
                    if ($scope.showWarningIcon)
                        objectHtml +=
                            '<i class="fa fa-exclamation-triangle unmatchedIcon"></i>';
                    objectHtml += '</div>';
                    var el = angular.element(objectHtml);
                    $compile(el)($scope);
                    $element.append(el);
                }
            };
        }])
}());